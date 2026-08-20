/**
 * @file contract.test.ts
 * @description Testes de contrato entre a API e o frontend.
 *
 * O que cobre:
 * - Contrato do endpoint /auth/login (User + token)
 * - Contrato do endpoint /tickets (array de Ticket)
 * - Contrato do endpoint /customers (array de Customer)
 * - Contrato do endpoint /agent/logs (array de AgentLog)
 * - Contrato do endpoint /health
 *
 * O que garante:
 * - Que a API nunca quebra os tipos definidos em apps/web/lib/types.ts
 * - Que campos obrigatorios sempre estao presentes nas respostas
 * - Que enums de status e priority sao sempre valores validos
 * - Que mudancas na API que quebrariam o frontend sao detectadas automaticamente
 *
 * Decisoes de design:
 * - Usa validacao manual de schema para evitar dependencia extra de bibliotecas
 * - Testa contra banco PostgreSQL real para validar dados reais
 * - Complementa os testes de integracao com validacao de contrato explicita
 */
import request from "supertest"
import app from "../app"

let token: string

beforeAll(async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "admin@climatech.com", password: "admin123" })
  token = res.body.token
})

function validateUser(user: any) {
  expect(typeof user.id).toBe("string")
  expect(typeof user.name).toBe("string")
  expect(typeof user.email).toBe("string")
  expect(typeof user.role).toBe("string")
}

function validateTicket(ticket: any) {
  expect(typeof ticket.id).toBe("string")
  expect(typeof ticket.title).toBe("string")
  expect(typeof ticket.description).toBe("string")
  expect(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).toContain(ticket.status)
  expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(ticket.priority)
  expect(typeof ticket.createdAt).toBe("string")
  expect(ticket.customer).toBeDefined()
  expect(typeof ticket.customer.id).toBe("string")
  expect(typeof ticket.customer.name).toBe("string")
}

function validateCustomer(customer: any) {
  expect(typeof customer.id).toBe("string")
  expect(typeof customer.name).toBe("string")
  expect(typeof customer.createdAt).toBe("string")
}

function validateAgentLog(log: any) {
  expect(typeof log.id).toBe("string")
  expect(typeof log.action).toBe("string")
  expect(typeof log.createdAt).toBe("string")
}

describe("Contratos de API", () => {
  describe("POST /auth/login", () => {
    it("deve retornar contrato User + token", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "admin@climatech.com", password: "admin123" })

      expect(res.status).toBe(200)
      expect(typeof res.body.token).toBe("string")
      validateUser(res.body.user)
    })
  })

  describe("GET /tickets", () => {
    it("deve retornar array com contrato Ticket", async () => {
      const res = await request(app)
        .get("/tickets")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("data")
      expect(res.body).toHaveProperty("pagination")
      expect(Array.isArray(res.body.data)).toBe(true)
      res.body.data.forEach(validateTicket)
    })
  })

  describe("GET /customers", () => {
    it("deve retornar array com contrato Customer", async () => {
      const res = await request(app)
        .get("/customers")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      res.body.forEach(validateCustomer)
    })
  })

  describe("GET /agent/logs", () => {
    it("deve retornar array com contrato AgentLog", async () => {
      const res = await request(app)
        .get("/agent/logs")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      res.body.forEach(validateAgentLog)
    })
  })

  describe("GET /health", () => {
    it("deve retornar contrato de health check", async () => {
      const res = await request(app).get("/health")

      expect(res.status).toBe(200)
      expect(typeof res.body.status).toBe("string")
      expect(typeof res.body.timestamp).toBe("string")
      expect(res.body.status).toBe("ok")
    })
  })
})
