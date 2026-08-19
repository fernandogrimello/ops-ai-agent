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
      expect(Array.isArray(res.body)).toBe(true)
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
