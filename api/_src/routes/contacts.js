import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { check, param, query } from 'express-validator'
import { validate } from '../middleware/validate.js'

const router = Router()

router.get('/', requireAuth, validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString()
]), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  const [rows] = await pool.query(
    'SELECT id,name,email,phone FROM contacts WHERE user_id=? AND name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
    [req.user.id, `%${search}%`, Number(limit), offset]
  )
  res.json(rows)
}))

router.get('/list', requireAuth, validate([
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString()
]), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query
  const offset = (Number(page) - 1) * Number(limit)
  const [[{ total }]] = await pool.query(
    'SELECT COUNT(*) AS total FROM contacts WHERE user_id=? AND name LIKE ?',
    [req.user.id, `%${search}%`]
  )
  const [rows] = await pool.query(
    'SELECT id,name,email,phone FROM contacts WHERE user_id=? AND name LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?',
    [req.user.id, `%${search}%`, Number(limit), offset]
  )
  res.json({ items: rows, total, page: Number(page), limit: Number(limit) })
}))

router.post('/', requireAuth, validate([
  check('name').isString().isLength({ min: 1 }),
  check('email').optional().isEmail(),
  check('phone').optional().isString().isLength({ max: 64 })
]), asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body || {}
  if (!name) return res.status(400).json({ error: 'Invalid' })
  const [r] = await pool.query(
    'INSERT INTO contacts (user_id,name,email,phone) VALUES (?,?,?,?)',
    [req.user.id, name, email || '', phone || '']
  )
  res.status(201).json({ id: r.insertId })
}))

router.patch('/:id', requireAuth, validate([
  param('id').isInt({ min: 1 }),
  check('name').optional().isString(),
  check('email').optional().isEmail(),
  check('phone').optional().isString().isLength({ max: 64 })
]), asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body || {}
  const id = Number(req.params.id)
  await pool.query(
    'UPDATE contacts SET name=COALESCE(?,name), email=COALESCE(?,email), phone=COALESCE(?,phone) WHERE id=? AND user_id=?',
    [name, email, phone, id, req.user.id]
  )
  res.json({ ok: true })
}))

router.delete('/:id', requireAuth, validate([
  param('id').isInt({ min: 1 })
]), asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  await pool.query('DELETE FROM contacts WHERE id=? AND user_id=?', [id, req.user.id])
  res.status(204).end()
}))

export default router
