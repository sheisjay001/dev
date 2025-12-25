import 'dotenv/config'
import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

async function run() {
  const sql = fs.readFileSync(path.join(process.cwd(), 'schema.sql'), 'utf8')
  const statements = sql.split(';\n').map(s => s.trim()).filter(Boolean)
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  })
  for (const s of statements) await conn.query(s)
  await conn.end()
  process.stdout.write('migrated\n')
  process.exit(0)
}

run().catch(e => {
  process.stderr.write(String(e) + '\n')
  process.exit(1)
})
