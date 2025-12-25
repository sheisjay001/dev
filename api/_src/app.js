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
const router = express.Router()
router.get('/health', (req, res) => res.json({ ok: true }))
router.use('/auth', authRoutes)
router.use('/contacts', contactRoutes)
router.use('/deals', dealRoutes)

app.use('/api', router)
app.use('/', router)
app.use(notFound)
app.use(errorHandler)

export default app
