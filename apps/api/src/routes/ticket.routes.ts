import { Router } from 'express'
import { listTickets, getTicket, createTicket, updateTicket } from '../controllers/ticket.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', listTickets)
router.get('/:id', getTicket)
router.post('/', createTicket)
router.put('/:id', updateTicket)

export default router
