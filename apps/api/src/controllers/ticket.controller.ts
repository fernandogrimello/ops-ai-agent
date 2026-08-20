import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/auth'
import { createTicketSchema, updateTicketSchema } from '../schemas/ticket.schema'
import { classifyTicket } from '../services/ai.service'

export async function listTickets(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20))
    const skip = (page - 1) * limit

    const status = req.query.status as string | undefined
    const priority = req.query.priority as string | undefined

    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          customer: { select: { id: true, name: true, company: true } },
          assignee: { select: { id: true, name: true } },
          _count: { select: { tasks: true } }
        }
      }),
      prisma.ticket.count({ where })
    ])

    res.json({
      data: tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getTicket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: String(req.params.id) },
      include: {
        customer: true,
        assignee: { select: { id: true, name: true } },
        tasks: { orderBy: { createdAt: 'desc' } },
        logs: { orderBy: { createdAt: 'desc' }, take: 20 }
      }
    })
    if (!ticket) {
      res.status(404).json({ error: 'Ticket not found' })
      return
    }
    res.json(ticket)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function createTicket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = createTicketSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }

    const { title, description, customerId } = parsed.data

    const customer = await prisma.customer.findUnique({ where: { id: customerId } })
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' })
      return
    }

    const classification = await classifyTicket(description)

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        customerId,
        category: classification.category,
        priority: classification.priority,
        summary: classification.summary,
      },
      include: {
        customer: { select: { id: true, name: true, company: true } }
      }
    })

    await prisma.agentLog.create({
      data: {
        action: 'AI_CLASSIFICATION',
        input: description,
        output: JSON.stringify(classification),
        ticketId: ticket.id,
        userId: req.userId,
      }
    })

    res.status(201).json({ ticket, classification })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function updateTicket(req: AuthRequest, res: Response): Promise<void> {
  try {
    const parsed = updateTicketSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }
    const ticket = await prisma.ticket.update({
      where: { id: String(req.params.id) },
      data: parsed.data
    })
    res.json(ticket)
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Ticket not found' })
      return
    }
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
