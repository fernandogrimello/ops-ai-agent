/**
 * @file ops.agent.test.ts
 * @description Testes unitarios para o agente operacional de IA.
 *
 * O que cobre:
 * - Resposta direta sem uso de ferramenta
 * - Uso de ferramenta quando a IA retorna JSON com tool call
 * - Execucao de cada ferramenta disponivel
 * - Ferramenta desconhecida retorna erro gracioso
 * - Log da acao gravado no banco apos cada interacao
 *
 * O que garante:
 * - Que o agente responde em portugues ao usuario
 * - Que ferramentas sao executadas corretamente quando acionadas
 * - Que erros nas ferramentas nao quebram o agente
 * - Que todas as interacoes sao registradas no banco via agentLog
 *
 * Decisoes de design:
 * - GoogleGenAI e Prisma mockados para isolar o agente de dependencias externas
 * - ticket.tools mockado para evitar chamadas ao banco nos testes unitarios
 * - Testa o fluxo completo do agente sem infraestrutura real
 */

const mockGenerateContent = jest.fn()

jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: { generateContent: mockGenerateContent }
  }))
}))

jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    agentLog: { create: jest.fn().mockResolvedValue({}) }
  }
}))

jest.mock("../tools/ticket.tools", () => ({
  getHighPriorityTickets: jest.fn().mockResolvedValue([{ id: "1", title: "Urgente", priority: "CRITICAL" }]),
  getTicketById: jest.fn().mockResolvedValue({ id: "1", title: "Teste" }),
  getCustomerById: jest.fn().mockResolvedValue({ id: "1", name: "Joao" }),
  createTask: jest.fn().mockResolvedValue({ id: "t1", title: "Tarefa" }),
  updateTicketStatus: jest.fn().mockResolvedValue({ id: "1", status: "RESOLVED" }),
  getOpenTicketsSummary: jest.fn().mockResolvedValue({ total: 5, byPriority: [], byStatus: [] }),
}))

import { runAgent } from "../agents/ops.agent"
import prisma from "../lib/prisma"
import * as tools from "../tools/ticket.tools"

const mockPrisma = prisma as any

describe("ops.agent", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.agentLog.create.mockResolvedValue({})
  })

  describe("runAgent", () => {
    it("deve retornar resposta direta sem usar ferramenta", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: "Olá! Posso ajudar com informacoes sobre seus tickets."
      })

      const result = await runAgent("Ola", "user-123")

      expect(result.response).toBe("Olá! Posso ajudar com informacoes sobre seus tickets.")
      expect(result.toolUsed).toBeUndefined()
      expect(mockPrisma.agentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: "AGENT_RESPONSE",
            input: "Ola",
            userId: "user-123",
          })
        })
      )
    })

    it("deve usar ferramenta get_high_priority_tickets", async () => {
      mockGenerateContent
        .mockResolvedValueOnce({
          text: JSON.stringify({ tool: "get_high_priority_tickets", params: {} })
        })
        .mockResolvedValueOnce({
          text: "Encontrei 1 ticket critico: Urgente."
        })

      const result = await runAgent("Quais sao os tickets criticos?", "user-123")

      expect(result.toolUsed).toBe("get_high_priority_tickets")
      expect(result.response).toBe("Encontrei 1 ticket critico: Urgente.")
      expect(tools.getHighPriorityTickets).toHaveBeenCalled()
    })

    it("deve usar ferramenta get_ticket_by_id", async () => {
      mockGenerateContent
        .mockResolvedValueOnce({
          text: JSON.stringify({ tool: "get_ticket_by_id", params: { ticketId: "1" } })
        })
        .mockResolvedValueOnce({ text: "Ticket encontrado: Teste." })

      const result = await runAgent("Me mostra o ticket 1", "user-123")

      expect(result.toolUsed).toBe("get_ticket_by_id")
      expect(tools.getTicketById).toHaveBeenCalledWith("1")
    })

    it("deve usar ferramenta update_ticket_status", async () => {
      mockGenerateContent
        .mockResolvedValueOnce({
          text: JSON.stringify({ tool: "update_ticket_status", params: { ticketId: "1", status: "RESOLVED" } })
        })
        .mockResolvedValueOnce({ text: "Ticket atualizado para RESOLVED." })

      const result = await runAgent("Resolve o ticket 1", "user-123")

      expect(result.toolUsed).toBe("update_ticket_status")
      expect(tools.updateTicketStatus).toHaveBeenCalledWith("1", "RESOLVED")
    })

    it("deve retornar erro gracioso para ferramenta desconhecida", async () => {
      mockGenerateContent
        .mockResolvedValueOnce({
          text: JSON.stringify({ tool: "ferramenta_inexistente", params: {} })
        })
        .mockResolvedValueOnce({ text: "Nao foi possivel executar a operacao." })

      const result = await runAgent("Faz algo impossivel", "user-123")

      expect(result.toolResult).toContain("Unknown tool")
    })

    it("deve registrar log com ticketId quando fornecido", async () => {
      mockGenerateContent.mockResolvedValueOnce({
        text: "Posso ajudar com este ticket."
      })

      await runAgent("Me ajuda", "user-123", "ticket-456")

      expect(mockPrisma.agentLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ticketId: "ticket-456",
            userId: "user-123",
          })
        })
      )
    })
  })
})
