import 'dotenv/config'
import request from 'supertest'
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { jest } from '@jest/globals'

let app
let token = ''
const dbName = 'crm_test'

jest.setTimeout(20000)
process.env.JWT_SECRET = 'testsecret'

async function resetDb() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  })
  await conn.query(`DROP DATABASE IF EXISTS ${dbName}`)
  const sql = fs.readFileSync(path.join(process.cwd(), 'schema.sql'), 'utf8').replaceAll('crm_dev', dbName)
  const statements = sql.split(';\n').map(s => s.trim()).filter(Boolean)
  for (const s of statements) await conn.query(s)
  await conn.end()
}

beforeAll(async () => {
  process.env.DB_NAME = dbName
  await resetDb()
  app = (await import('../_src/app.js')).default
  const email = 'duser@example.com'
  const password = 'password'
  await request(app).post('/auth/register').send({ email, password, name: 'U' })
  const r = await request(app).post('/auth/login').send({ email, password })
  token = r.body.token
})

test('create and update deal stage', async () => {
  const r1 = await request(app)
    .post('/deals')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Project X', amount: 1000, stage: 'new' })
  expect(r1.statusCode).toBe(201)
  const id = r1.body.id
  const r2 = await request(app)
    .patch(`/deals/${id}/stage`)
    .set('Authorization', `Bearer ${token}`)
    .send({ stage: 'qualified' })
  expect(r2.statusCode).toBe(200)
  const r3 = await request(app)
    .get('/deals')
    .set('Authorization', `Bearer ${token}`)
  expect(r3.statusCode).toBe(200)
  expect(r3.body.some(d => d.id === id && d.stage === 'qualified')).toBe(true)
})

test('reject invalid stage', async () => {
  const r1 = await request(app)
    .post('/deals')
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Bad Stage', amount: 100, stage: 'new' })
  const id = r1.body.id
  const r2 = await request(app)
    .patch(`/deals/${id}/stage`)
    .set('Authorization', `Bearer ${token}`)
    .send({ stage: 'invalid' })
  expect(r2.statusCode).toBe(400)
})

afterAll(async () => {
  const { pool } = await import('../_src/db.js')
  await pool.end()
})
