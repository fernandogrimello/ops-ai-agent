import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customer.schema'

export async function listCustomers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { tickets: true } } }
    })
    res.json(customers)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getCustomer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { tickets: { orderBy: { createdAt: 'desc' }, take: 10 } }
    })
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' })
      return
    }
    res.json(customer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function createCustomer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = createCustomerSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const customer = await prisma.customer.create({ data: parsed.data })
    res.status(201).json(customer)
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Email already in use' })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateCustomer(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = updateCustomerSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: parsed.data
    })
    res.json(customer)
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Customer not found' })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function deleteCustomer(req: AuthRequest, res: Response): Promise<void> {
  try {
    await prisma.customer.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Customer not found' })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
