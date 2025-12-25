import 'dotenv/config'
import mysql from 'mysql2/promise'
import request from 'supertest'
import fs from 'fs'
import path from 'path'
import { jest } from '@jest/globals'

const dbName = 'crm_test'
let app

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
})

afterAll(async () => {
  const { pool } = await import('../src/db.js')
  await pool.end()
})

test('register and login', async () => {
  const email = 'user@example.com'
  const password = 'password'
  const r1 = await request(app).post('/auth/register').send({ email, password, name: 'User' })
  expect(r1.statusCode).toBe(200)
  expect(r1.body.token).toBeTruthy()
  const r2 = await request(app).post('/auth/login').send({ email, password })
  expect(r2.statusCode).toBe(200)
  expect(r2.body.token).toBeTruthy()
})

test('register invalid email', async () => {
  const r = await request(app).post('/auth/register').send({ email: 'bad', password: 'secret' })
  expect(r.statusCode).toBe(400)
})

test('login wrong password', async () => {
  const email = 'user2@example.com'
  const password = 'password'
  await request(app).post('/auth/register').send({ email, password, name: 'U' })
  const r = await request(app).post('/auth/login').send({ email, password: 'wrongpw' })
  expect(r.statusCode).toBe(401)
})
