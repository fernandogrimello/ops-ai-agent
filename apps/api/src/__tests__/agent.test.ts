/**
 * @file agent.test.ts
 * @description Testes de integracao para as rotas do agente operacional de IA.
 *
 * O que cobre:
 * - Envio de mensagens para o agente via /agent/chat
 * - Validacao de campos obrigatorios (mensagem vazia)
 * - Listagem do historico de logs do agente
 * - Controle de acesso via JWT
 *
 * O que garante:
 * - Que o agente responde com texto ao receber uma mensagem valida
 * - Que mensagens vazias sao rejeitadas com 400
 * - Que o historico de logs e retornado como array
 * - Que todas as rotas exigem autenticacao (401 sem token)
 *
 * Decisoes de design:
 * - runAgent mockado para isolar a logica da API do Google Gemini
 * - Mock evita consumo de quota da API gratuita durante os testes
 * - Testa o contrato da rota (entrada/saida) sem depender da IA real
 */
import request from "supertest"
import app from "../app"

// Mock do agente para nao consumir quota da IA
jest.mock("../agents/ops.agent", () => ({
  runAgent: jest.fn().mockResolvedValue({
    response: "Existem 2 tickets criticos abertos no momento.",
    actions: []
  })
}))

let token: string

beforeAll(async () => {
  const res = await request(app)
    .post("/auth/login")
    .send({ email: "admin@climatech.com", password: "admin123" })
  token = res.body.token
})

describe("Agent", () => {
  describe("POST /agent/chat", () => {
    it("deve responder mensagem do agente", async () => {
      const res = await request(app)
        .post("/agent/chat")
        .set("Authorization", `Bearer ${token}`)
        .send({ message: "Quais sao os tickets criticos?" })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("response")
      expect(typeof res.body.response).toBe("string")
    })

    it("deve retornar 400 sem mensagem", async () => {
      const res = await request(app)
        .post("/agent/chat")
        .set("Authorization", `Bearer ${token}`)
        .send({})

      expect(res.status).toBe(400)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app)
        .post("/agent/chat")
        .send({ message: "teste" })

      expect(res.status).toBe(401)
    })
  })

  describe("GET /agent/logs", () => {
    it("deve retornar logs do agente", async () => {
      const res = await request(app)
        .get("/agent/logs")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/agent/logs")
      expect(res.status).toBe(401)
    })
  })
})
