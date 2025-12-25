import jwt from 'jsonwebtoken'

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || ''
  const parts = h.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Unauthorized' })
  try {
    const payload = jwt.verify(parts[1], process.env.JWT_SECRET || 'devsecret')
    req.user = { id: payload.sub, role: payload.role }
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
