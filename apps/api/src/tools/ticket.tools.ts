import prisma from '../lib/prisma'

export async function getHighPriorityTickets() {
  const tickets = await prisma.ticket.findMany({
    where: { priority: { in: ['HIGH', 'CRITICAL'] }, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    include: { customer: { select: { name: true, company: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  return tickets
}

export async function getTicketById(ticketId: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      customer: true,
      tasks: true,
      logs: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  })
  return ticket
}

export async function getCustomerById(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { tickets: { orderBy: { createdAt: 'desc' }, take: 5 } }
  })
  return customer
}

export async function createTask(ticketId: string, title: string, description?: string) {
  const task = await prisma.task.create({
    data: { ticketId, title, description }
  })
  return task
}

export async function updateTicketStatus(ticketId: string, status: string) {
  const ticket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: status as any }
  })
  return ticket
}

export async function getOpenTicketsSummary() {
  const [total, byPriority, byStatus] = await Promise.all([
    prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.ticket.groupBy({ by: ['priority'], where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }, _count: true }),
    prisma.ticket.groupBy({ by: ['status'], _count: true })
  ])
  return { total, byPriority, byStatus }
}
