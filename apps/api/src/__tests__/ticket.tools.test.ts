/**
 * @file ticket.tools.test.ts
 * @description Testes unitarios para as ferramentas do agente de IA.
 *
 * O que cobre:
 * - getHighPriorityTickets: busca tickets HIGH e CRITICAL em aberto
 * - getTicketById: busca ticket por ID com dados relacionados
 * - getCustomerById: busca cliente por ID com historico de tickets
 * - createTask: cria tarefa vinculada a um ticket
 * - updateTicketStatus: atualiza status de um ticket
 * - getOpenTicketsSummary: retorna resumo estatistico dos tickets abertos
 *
 * O que garante:
 * - Que cada ferramenta chama o Prisma com os parametros corretos
 * - Que os dados retornados pelo Prisma sao repassados corretamente
 * - Que tickets inexistentes retornam null sem lancar erro
 *
 * Decisoes de design:
 * - Prisma mockado para isolar as ferramentas do banco de dados
 * - Testes unitarios puros — sem HTTP, sem banco real
 * - Cada ferramenta testada de forma independente
 */

jest.mock("../lib/prisma", () => {
  const mockTicket = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  }
  const mockCustomer = { findUnique: jest.fn() }
  const mockTask = { create: jest.fn() }
  return {
    __esModule: true,
    default: { ticket: mockTicket, customer: mockCustomer, task: mockTask }
  }
})

import prisma from "../lib/prisma"
import {
  getHighPriorityTickets,
  getTicketById,
  getCustomerById,
  createTask,
  updateTicketStatus,
  getOpenTicketsSummary,
} from "../tools/ticket.tools"

const mockPrisma = prisma as any

describe("ticket.tools", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("getHighPriorityTickets", () => {
    it("deve retornar tickets de alta prioridade", async () => {
      const mockTickets = [
        { id: "1", title: "Urgente", priority: "CRITICAL", status: "OPEN" }
      ]
      mockPrisma.ticket.findMany.mockResolvedValue(mockTickets)

      const result = await getHighPriorityTickets()

      expect(result).toEqual(mockTickets)
      expect(mockPrisma.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { priority: { in: ["HIGH", "CRITICAL"] }, status: { in: ["OPEN", "IN_PROGRESS"] } }
        })
      )
    })

    it("deve retornar array vazio quando nao ha tickets", async () => {
      mockPrisma.ticket.findMany.mockResolvedValue([])
      const result = await getHighPriorityTickets()
      expect(result).toEqual([])
    })
  })

  describe("getTicketById", () => {
    it("deve retornar ticket pelo id", async () => {
      const mockTicket = { id: "123", title: "Teste", customer: {}, tasks: [], logs: [] }
      mockPrisma.ticket.findUnique.mockResolvedValue(mockTicket)

      const result = await getTicketById("123")

      expect(result).toEqual(mockTicket)
      expect(mockPrisma.ticket.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "123" } })
      )
    })

    it("deve retornar null para ticket inexistente", async () => {
      mockPrisma.ticket.findUnique.mockResolvedValue(null)
      const result = await getTicketById("nao-existe")
      expect(result).toBeNull()
    })
  })

  describe("getCustomerById", () => {
    it("deve retornar cliente pelo id", async () => {
      const mockCustomer = { id: "456", name: "Joao", tickets: [] }
      mockPrisma.customer.findUnique.mockResolvedValue(mockCustomer)

      const result = await getCustomerById("456")

      expect(result).toEqual(mockCustomer)
      expect(mockPrisma.customer.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "456" } })
      )
    })

    it("deve retornar null para cliente inexistente", async () => {
      mockPrisma.customer.findUnique.mockResolvedValue(null)
      const result = await getCustomerById("nao-existe")
      expect(result).toBeNull()
    })
  })

  describe("createTask", () => {
    it("deve criar tarefa vinculada ao ticket", async () => {
      const mockTask = { id: "t1", ticketId: "123", title: "Verificar instalacao" }
      mockPrisma.task.create.mockResolvedValue(mockTask)

      const result = await createTask("123", "Verificar instalacao", "Descricao opcional")

      expect(result).toEqual(mockTask)
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: { ticketId: "123", title: "Verificar instalacao", description: "Descricao opcional" }
      })
    })
  })

  describe("updateTicketStatus", () => {
    it("deve atualizar status do ticket", async () => {
      const mockTicket = { id: "123", status: "RESOLVED" }
      mockPrisma.ticket.update.mockResolvedValue(mockTicket)

      const result = await updateTicketStatus("123", "RESOLVED")

      expect(result).toEqual(mockTicket)
      expect(mockPrisma.ticket.update).toHaveBeenCalledWith({
        where: { id: "123" },
        data: { status: "RESOLVED" }
      })
    })
  })

  describe("getOpenTicketsSummary", () => {
    it("deve retornar resumo dos tickets abertos", async () => {
      mockPrisma.ticket.count.mockResolvedValue(5)
      mockPrisma.ticket.groupBy.mockResolvedValue([])

      const result = await getOpenTicketsSummary()

      expect(result).toHaveProperty("total", 5)
      expect(result).toHaveProperty("byPriority")
      expect(result).toHaveProperty("byStatus")
    })
  })
})
