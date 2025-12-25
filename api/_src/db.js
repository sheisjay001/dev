import mysql from 'mysql2/promise'

const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env

export const pool = mysql.createPool({
  host: DB_HOST || '127.0.0.1',
  user: DB_USER || 'root',
  password: DB_PASSWORD || '',
  database: DB_NAME || 'crm_dev',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
