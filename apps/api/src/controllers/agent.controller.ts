import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import { runAgent } from '../agents/ops.agent'
import prisma from '../lib/prisma'

export async function chat(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { message, ticketId } = req.body

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' })
      return
    }

    const result = await runAgent(message, req.userId!, ticketId)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export async function getLogs(req: AuthRequest, res: Response): Promise<void> {
  try {
    const logs = await prisma.agentLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        ticket: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } }
      }
    })
    res.json(logs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
