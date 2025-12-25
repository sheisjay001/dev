import 'dotenv/config'
import request from 'supertest'
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { jest } from '@jest/globals'

let token = ''
let app
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
  app = (await import('../src/app.js')).default
  const email = 'cuser@example.com'
  const password = 'password'
  await request(app).post('/auth/register').send({ email, password, name: 'U' })
  const r = await request(app).post('/auth/login').send({ email, password })
  token = r.body.token
})

test('create and list contacts', async () => {
  const r1 = await request(app)
    .post('/contacts')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Alice', email: 'a@example.com', phone: '123' })
  expect(r1.statusCode).toBe(201)
  const r2 = await request(app)
    .get('/contacts?page=1&limit=5&search=Ali')
    .set('Authorization', `Bearer ${token}`)
  expect(r2.statusCode).toBe(200)
  expect(Array.isArray(r2.body)).toBe(true)
  expect(r2.body.some(c => c.name === 'Alice')).toBe(true)
})

test('reject invalid contact', async () => {
  const r = await request(app)
    .post('/contacts')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: '', email: 'bad' })
  expect(r.statusCode).toBe(400)
})

afterAll(async () => {
  const { pool } = await import('../src/db.js')
  await pool.end()
})
