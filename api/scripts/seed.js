import 'dotenv/config'
import { pool } from '../src/db.js'

async function run() {
  const [users] = await pool.query('SELECT id FROM users LIMIT 1')
  let userId
  if (!users.length) {
    const [r] = await pool.query("INSERT INTO users (email,password_hash,name) VALUES ('demo@example.com','$2a$10$XPWd8I1ppiOUXNrzBsRrxe49KciFz3Vyfs7UKYhIsyAOzmeOen94O','Demo')")
    userId = r.insertId
  } else {
    userId = users[0].id
    await pool.query("UPDATE users SET password_hash='$2a$10$XPWd8I1ppiOUXNrzBsRrxe49KciFz3Vyfs7UKYhIsyAOzmeOen94O' WHERE email='demo@example.com'")
  }
  await pool.query("INSERT INTO contacts (user_id,name,email,phone) VALUES (?,?,?,?),(?,?,?,?)", [userId,'Alice','alice@example.com','0801-111-1111', userId,'Bob','bob@example.com','0802-222-2222'])
  await pool.query("INSERT INTO deals (user_id,title,amount,stage) VALUES (?,?,?,?),(?,?,?,?)", [userId,'Website Revamp',500000,'qualified', userId,'Mobile App',1500000,'new'])
  process.stdout.write('seeded\n')
  process.exit(0)
}

run().catch(e => {
  process.stderr.write(String(e)+'\n')
  process.exit(1)
})
