import { Router } from 'express'
import { chat, getLogs } from '../controllers/agent.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.post('/chat', chat)
router.get('/logs', getLogs)

export default router
