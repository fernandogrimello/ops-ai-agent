/**
 * @file tickets.test.ts
 * @description Testes de integracao para as rotas de tickets (atendimentos) da API.
 *
 * O que cobre:
 * - Listagem de tickets com autenticacao
 * - Criacao de ticket com classificacao automatica por IA (mockada)
 * - Busca de ticket por ID
 * - Atualizacao de status do ticket
 * - Validacao de campos obrigatorios
 * - Controle de acesso via JWT
 *
 * O que garante:
 * - Que tickets sao criados corretamente com titulo, descricao e cliente
 * - Que a IA classifica o ticket (prioridade, categoria) — mockada para nao consumir quota
 * - Que tickets podem ser buscados e atualizados por ID
 * - Que IDs inexistentes retornam 404
 * - Que todas as rotas exigem autenticacao (401 sem token)
 *
 * Decisoes de design:
 * - classifyTicket mockado para isolar logica de negocio da API externa do Gemini
 * - Testa contra banco PostgreSQL real para maior fidelidade
 * - beforeAll compartilha token entre todos os testes do arquivo
 */
import request from "supertest"
import app from "../app"

// Mock do servico de IA para nao consumir quota
jest.mock("../services/ai.service", () => ({
  classifyTicket: jest.fn().mockResolvedValue({
    category: "urgencia",
    priority: "CRITICAL",
    summary: "Ticket de teste automatizado",
    suggestedAction: "Entrar em contato com o cliente"
  })
}))

let token: string

beforeAll(async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "admin@climatech.com", password: "admin123" })
  token = res.body.token
})

describe("Tickets", () => {
  describe("GET /tickets", () => {
    it("deve retornar lista de tickets", async () => {
      const res = await request(app)
        .get("/tickets")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("data")
      expect(res.body).toHaveProperty("pagination")
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.pagination).toHaveProperty("total")
      expect(res.body.pagination).toHaveProperty("page")
      expect(res.body.pagination).toHaveProperty("totalPages")
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/tickets")
      expect(res.status).toBe(401)
    })
  })

  describe("POST /tickets", () => {
    it("deve criar ticket com dados validos", async () => {
      const res = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Teste automatizado - ar condicionado com defeito",
          description: "Teste criado via suite de testes automatizados",
          customerId: "cmswfdi1v0000lhij54cdupc4"
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty("ticket")
      expect(res.body.ticket).toHaveProperty("id")
      expect(res.body.ticket.title).toContain("Teste automatizado")
      expect(res.body.ticket).toHaveProperty("priority")
      expect(res.body.ticket).toHaveProperty("category")
    })

    it("deve retornar 400 sem titulo", async () => {
      const res = await request(app)
        .post("/tickets")
        .set("Authorization", `Bearer ${token}`)
        .send({
          description: "Sem titulo",
          customerId: "cmswfdi1v0000lhij54cdupc4"
        })

      expect(res.status).toBe(400)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app)
        .post("/tickets")
        .send({
          title: "Ticket sem auth",
          description: "Teste",
          customerId: "cmswfdi1v0000lhij54cdupc4"
        })

      expect(res.status).toBe(401)
    })
  })

  describe("GET /health", () => {
    it("deve retornar status ok", async () => {
      const res = await request(app).get("/health")
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("status", "ok")
    })
  })
})

describe("Ticket por ID", () => {
  let ticketId: string

  beforeAll(async () => {
    const res = await request(app)
      .get("/tickets")
      .set("Authorization", `Bearer ${token}`)
    if (res.body.data && res.body.data.length > 0) {
      ticketId = res.body.data[0].id
    }
  })

  describe("GET /tickets/:id", () => {
    it("deve retornar ticket pelo id", async () => {
      if (!ticketId) return
      const res = await request(app)
        .get(`/tickets/${ticketId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("id", ticketId)
      expect(res.body).toHaveProperty("customer")
    })

    it("deve retornar 404 para id inexistente", async () => {
      const res = await request(app)
        .get("/tickets/id-inexistente-xyz")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(404)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/tickets/qualquer-id")
      expect(res.status).toBe(401)
    })
  })

  describe("PUT /tickets/:id", () => {
    it("deve atualizar status do ticket", async () => {
      if (!ticketId) return
      const res = await request(app)
        .put(`/tickets/${ticketId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "IN_PROGRESS" })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("status", "IN_PROGRESS")
    })

    it("deve retornar 404 para ticket inexistente", async () => {
      const res = await request(app)
        .put("/tickets/id-inexistente-xyz")
        .set("Authorization", `Bearer ${token}`)
        .send({ status: "RESOLVED" })

      expect(res.status).toBe(404)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app)
        .put("/tickets/qualquer-id")
        .send({ status: "RESOLVED" })

      expect(res.status).toBe(401)
    })
  })
})

describe("Paginacao de tickets", () => {
  it("deve retornar pagina 1 com limite padrao", async () => {
    const res = await request(app)
      .get("/tickets")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.pagination.page).toBe(1)
    expect(res.body.pagination.limit).toBe(20)
    expect(typeof res.body.pagination.total).toBe("number")
    expect(typeof res.body.pagination.totalPages).toBe("number")
    expect(typeof res.body.pagination.hasNext).toBe("boolean")
    expect(typeof res.body.pagination.hasPrev).toBe("boolean")
  })

  it("deve respeitar parametro limit", async () => {
    const res = await request(app)
      .get("/tickets?limit=5")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.pagination.limit).toBe(5)
    expect(res.body.data.length).toBeLessThanOrEqual(5)
  })

  it("deve filtrar por status", async () => {
    const res = await request(app)
      .get("/tickets?status=OPEN")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    res.body.data.forEach((ticket: any) => {
      expect(ticket.status).toBe("OPEN")
    })
  })

  it("deve filtrar por priority", async () => {
    const res = await request(app)
      .get("/tickets?priority=CRITICAL")
      .set("Authorization", `Bearer ${token}`)

    expect(res.status).toBe(200)
    res.body.data.forEach((ticket: any) => {
      expect(ticket.priority).toBe("CRITICAL")
    })
  })
})
