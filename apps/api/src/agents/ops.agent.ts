import { GoogleGenAI } from '@google/genai'
import prisma from '../lib/prisma'
import {
  getHighPriorityTickets,
  getTicketById,
  getCustomerById,
  createTask,
  updateTicketStatus,
  getOpenTicketsSummary
} from '../tools/ticket.tools'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

const TOOLS_DESCRIPTION = `
You are an operational AI agent for ClimaTech, an air conditioning company.
You have access to the following tools:

- get_high_priority_tickets: Returns all HIGH and CRITICAL priority open tickets
- get_ticket_by_id(ticketId): Returns full details of a specific ticket
- get_customer_by_id(customerId): Returns customer details and their tickets
- create_task(ticketId, title, description): Creates a task for a ticket
- update_ticket_status(ticketId, status): Updates ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED)
- get_open_tickets_summary: Returns a summary of open tickets by priority and status

When the user asks something, identify which tool to use, call it, and respond naturally in Portuguese.
Always respond in a concise and professional manner.

To call a tool, respond ONLY with this JSON format (no other text):
{"tool": "tool_name", "params": {"param1": "value1"}}

After receiving the tool result, respond naturally to the user in Portuguese.
`

export interface AgentMessage {
  role: 'user' | 'agent'
  content: string
}

async function executeTool(toolName: string, params: Record<string, any>): Promise<string> {
  try {
    switch (toolName) {
      case 'get_high_priority_tickets':
        return JSON.stringify(await getHighPriorityTickets())
      case 'get_ticket_by_id':
        return JSON.stringify(await getTicketById(params.ticketId))
      case 'get_customer_by_id':
        return JSON.stringify(await getCustomerById(params.customerId))
      case 'create_task':
        return JSON.stringify(await createTask(params.ticketId, params.title, params.description))
      case 'update_ticket_status':
        return JSON.stringify(await updateTicketStatus(params.ticketId, params.status))
      case 'get_open_tickets_summary':
        return JSON.stringify(await getOpenTicketsSummary())
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` })
    }
  } catch (err: any) {
    return JSON.stringify({ error: err.message })
  }
}

export async function runAgent(
  userMessage: string,
  userId: string,
  ticketId?: string
): Promise<{ response: string; toolUsed?: string; toolResult?: string }> {

  const contextNote = ticketId ? `\nCurrent ticket context: ${ticketId}` : ''

  const prompt = `${TOOLS_DESCRIPTION}${contextNote}

User: ${userMessage}

Respond with a JSON tool call OR a natural language response in Portuguese.`

  const result = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt,
  })

  const text = result.text?.trim() || ''

  let toolUsed: string | undefined
  let toolResult: string | undefined
  let finalResponse: string

  try {
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    if (parsed.tool) {
      toolUsed = parsed.tool
      toolResult = await executeTool(parsed.tool, parsed.params || {})

      const followUp = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Voce e um assistente operacional da ClimaTech.

O usuario perguntou: "${userMessage}"
Resultado da consulta ao sistema: ${toolResult}

Responda ao usuario em portugues de forma clara, concisa e profissional. Nao use JSON na resposta.`,
      })

      finalResponse = followUp.text?.trim() || 'Operacao concluida.'
    } else {
      finalResponse = text
    }
  } catch {
    finalResponse = text
  }

  try {
    await prisma.agentLog.create({
      data: {
        action: toolUsed || 'AGENT_RESPONSE',
        input: userMessage,
        output: finalResponse,
        ticketId: ticketId || null,
        userId,
      }
    })
  } catch {
    // userId can be stale after seed reset — log silently
  }

  return { response: finalResponse, toolUsed, toolResult }
}
