import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error.js'
import { check, param } from 'express-validator'
import { validate } from '../middleware/validate.js'

const router = Router()

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id,title,amount,stage FROM deals WHERE user_id=? ORDER BY id DESC',
    [req.user.id]
  )
  res.json(rows)
}))

router.post('/', requireAuth, validate([
  check('title').isString().isLength({ min: 1 }),
  check('amount').optional().isFloat(),
  check('stage').optional().isIn(['new','qualified','won','lost'])
]), asyncHandler(async (req, res) => {
  const { title, amount, stage } = req.body || {}
  if (!title) return res.status(400).json({ error: 'Invalid' })
  const [r] = await pool.query(
    'INSERT INTO deals (user_id,title,amount,stage) VALUES (?,?,?,?)',
    [req.user.id, title, Number(amount) || 0, stage || 'new']
  )
  res.status(201).json({ id: r.insertId })
}))

router.patch('/:id/stage', requireAuth, validate([
  param('id').isInt({ min: 1 }),
  check('stage').isIn(['new','qualified','won','lost'])
]), asyncHandler(async (req, res) => {
  const id = Number(req.params.id)
  const { stage } = req.body || {}
  await pool.query('UPDATE deals SET stage=? WHERE id=? AND user_id=?', [stage || 'new', id, req.user.id])
  res.json({ ok: true })
}))

export default router
