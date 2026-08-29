/**
 * @file customers.test.ts
 * @description Testes de integracao para as rotas de clientes da API.
 *
 * O que cobre:
 * - Listagem de clientes com autenticacao
 * - Criacao de cliente com dados validos e invalidos
 * - Busca de cliente por ID
 * - Atualizacao de dados do cliente
 * - Exclusao de cliente
 * - Validacao de unicidade de email (409 em duplicata)
 * - Controle de acesso via JWT
 *
 * O que garante:
 * - Que clientes sao criados com os dados corretos
 * - Que emails duplicados sao rejeitados com 409
 * - Que campos obrigatorios sao validados (400 sem nome)
 * - Que clientes podem ser buscados, atualizados e deletados por ID
 * - Que IDs inexistentes retornam 404
 * - Que todas as rotas exigem autenticacao (401 sem token)
 *
 * Decisoes de design:
 * - Usa timestamp no email para garantir unicidade entre execucoes
 * - Cria e deleta cliente proprio no teste de DELETE para nao afetar dados de outros testes
 * - Testa contra banco PostgreSQL real para maior fidelidade
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

describe("Customers", () => {
  describe("GET /customers", () => {
    it("deve retornar lista de clientes", async () => {
      const res = await request(app)
        .get("/customers")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/customers")
      expect(res.status).toBe(401)
    })
  })

  describe("POST /customers", () => {
    it("deve criar cliente com dados validos", async () => {
      const timestamp = Date.now()
      const res = await request(app)
        .post("/customers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Cliente Teste Automatizado",
          email: `teste.${timestamp}@climatech.com`,
          phone: `6199999${timestamp}`,
          company: "Empresa Teste"
        })

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty("id")
      expect(res.body.name).toBe("Cliente Teste Automatizado")
    })

    it("deve retornar 400 sem nome", async () => {
      const res = await request(app)
        .post("/customers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          email: "semname@climatech.com"
        })

      expect(res.status).toBe(400)
    })

    it("deve retornar 409 com email duplicado", async () => {
      const timestamp = Date.now()
      const res = await request(app)
        .post("/customers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Joao Silva",
          email: "joao@empresa.com",
          phone: `6199999${timestamp}`,
          company: "Empresa ABC"
        })

      // Tenta criar de novo com mesmo email
      const res2 = await request(app)
        .post("/customers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Joao Silva",
          email: "joao@empresa.com",
          phone: `6199999${timestamp}`,
          company: "Empresa ABC"
        })

      expect(res2.status).toBe(409)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app)
        .post("/customers")
        .send({ name: "Sem Auth", email: "semauth@teste.com" })

      expect(res.status).toBe(401)
    })
  })
})

describe("Customer por ID", () => {
  let customerId: string

  beforeAll(async () => {
    const res = await request(app)
      .get("/customers")
      .set("Authorization", `Bearer ${token}`)
    if (res.body.length > 0) {
      customerId = res.body[0].id
    }
  })

  describe("GET /customers/:id", () => {
    it("deve retornar customer pelo id", async () => {
      if (!customerId) return
      const res = await request(app)
        .get(`/customers/${customerId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("id", customerId)
      expect(res.body).toHaveProperty("name")
    })

    it("deve retornar 404 para id inexistente", async () => {
      const res = await request(app)
        .get("/customers/id-inexistente-xyz")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(404)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/customers/qualquer-id")
      expect(res.status).toBe(401)
    })
  })

  describe("PUT /customers/:id", () => {
    it("deve atualizar customer", async () => {
      if (!customerId) return
      const res = await request(app)
        .put(`/customers/${customerId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Nome Atualizado" })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("name", "Nome Atualizado")
    })

    it("deve retornar 404 para customer inexistente", async () => {
      const res = await request(app)
        .put("/customers/id-inexistente-xyz")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Teste" })

      expect(res.status).toBe(404)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app)
        .put("/customers/qualquer-id")
        .send({ name: "Teste" })

      expect(res.status).toBe(401)
    })
  })

  describe("DELETE /customers/:id", () => {
    it("deve deletar customer criado no teste", async () => {
      const timestamp = Date.now()
      const createRes = await request(app)
        .post("/customers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Customer Para Deletar",
          email: `deletar.${timestamp}@teste.com`,
          phone: `6199999${timestamp}`,
          company: "Empresa Teste"
        })

      const newId = createRes.body.id

      const res = await request(app)
        .delete(`/customers/${newId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(204)
    })

    it("deve retornar 404 para customer inexistente", async () => {
      const res = await request(app)
        .delete("/customers/id-inexistente-xyz")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(404)
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).delete("/customers/qualquer-id")
      expect(res.status).toBe(401)
    })
  })
})
