import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import contactRoutes from './routes/contacts.js'
import dealRoutes from './routes/deals.js'
import { notFound, errorHandler } from './middleware/error.js'
import rateLimit from 'express-rate-limit'

const app = express()
app.use(cors())
app.use(express.json())
app.use(rateLimit(process.env.NODE_ENV === 'test' ? { windowMs: 1000, max: 1000 } : { windowMs: 15 * 60 * 1000, max: 300 }))
app.get('/health', (req, res) => res.json({ ok: true }))
app.use('/auth', authRoutes)
app.use('/contacts', contactRoutes)
app.use('/deals', dealRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
