import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { pool } from '../db.js'
import { asyncHandler } from '../middleware/error.js'
import { check } from 'express-validator'
import { validate } from '../middleware/validate.js'

const router = Router()

router.post('/register', validate([
  check('email').isEmail(),
  check('password').isLength({ min: 6 }),
  check('name').optional().isString()
]), asyncHandler(async (req, res) => {
  const { email, password, name } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Invalid' })
  const [rows] = await pool.query('SELECT id FROM users WHERE email=?', [email])
  if (rows.length) return res.status(409).json({ error: 'Exists' })
  const hash = await bcrypt.hash(password, 10)
  const [r] = await pool.query('INSERT INTO users (email,password_hash,name) VALUES (?,?,?)', [email, hash, name || ''])
  const userId = r.insertId
  const token = jwt.sign({ sub: userId, role: 'user' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1h' })
  res.json({ token })
}))

router.post('/login', validate([
  check('email').isEmail(),
  check('password').isLength({ min: 6 })
]), asyncHandler(async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Invalid' })
  const [rows] = await pool.query('SELECT id,password_hash FROM users WHERE email=?', [email])
  if (!rows.length) return res.status(401).json({ error: 'Unauthorized' })
  const ok = await bcrypt.compare(password, rows[0].password_hash)
  if (!ok) return res.status(401).json({ error: 'Unauthorized' })
  const token = jwt.sign({ sub: rows[0].id, role: 'user' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1h' })
  res.json({ token })
}))

export default router
