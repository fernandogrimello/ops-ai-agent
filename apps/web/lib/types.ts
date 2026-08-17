export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  company?: string
  createdAt: string
  _count?: { tickets: number }
}

export interface Ticket {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  category?: string
  summary?: string
  createdAt: string
  customer: { id: string; name: string; company?: string }
  assignee?: { id: string; name: string }
  _count?: { tasks: number }
}

export interface AgentLog {
  id: string
  action: string
  input?: string
  output?: string
  createdAt: string
  ticket?: { id: string; title: string }
  user?: { id: string; name: string }
}

export interface Summary {
  total: number
  byPriority: { priority: string; _count: number }[]
  byStatus: { status: string; _count: number }[]
}
