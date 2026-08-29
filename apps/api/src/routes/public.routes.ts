import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'
import { z } from 'zod'

const router = Router()

const quoteSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  service: z.enum(['instalacao', 'manutencao', 'orcamento']).optional(),
})

/**
 * Endpoint publico para solicitacao de orcamento.
 * Nao requer autenticacao — usado pela landing page.
 */
router.post('/quote', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = quoteSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() })
      return
    }

    const { name, phone, service } = parsed.data

    const customer = await prisma.customer.upsert({
      where: { phone },
      update: { name },
      create: { name, phone },
    })

    await prisma.ticket.create({
      data: {
        title: `Solicitacao de orcamento — ${service || 'geral'}`,
        description: `Cliente ${name} solicitou orcamento via landing page.`,
        priority: 'MEDIUM',
        category: service || 'orcamento',
        summary: `Orcamento solicitado via site.`,
        customerId: customer.id,
      }
    })

    res.status(201).json({ message: 'Solicitacao recebida com sucesso!' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro interno' })
  }
})

export default router
