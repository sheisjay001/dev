import { validationResult } from 'express-validator'

export function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const result = validationResult(req)
      if (!result.isEmpty()) return res.status(400).json({ error: 'Invalid', details: result.array() })
      next()
    }
  ]
}
