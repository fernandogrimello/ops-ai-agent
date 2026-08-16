import { Router } from 'express'
import { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customer.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/', listCustomers)
router.get('/:id', getCustomer)
router.post('/', createCustomer)
router.put('/:id', updateCustomer)
router.delete('/:id', deleteCustomer)

export default router
