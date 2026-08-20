/**
 * @file auth.test.ts
 * @description Testes de integracao para as rotas de autenticacao da API.
 *
 * O que cobre:
 * - Fluxo completo de login com credenciais validas e invalidas
 * - Validacao de schema do body (email invalido, campos faltando)
 * - Geracao e retorno de token JWT apos login bem-sucedido
 * - Rota protegida /auth/me com e sem token
 *
 * O que garante:
 * - Que usuarios validos conseguem se autenticar e receber um token
 * - Que credenciais invalidas sao rejeitadas com status 401
 * - Que dados malformados sao rejeitados com status 400 antes de chegar ao banco
 * - Que rotas protegidas bloqueiam acesso sem token (401)
 * - Que o token gerado permite acesso aos dados do usuario logado
 *
 * Decisoes de design:
 * - Testa contra banco PostgreSQL real para maior fidelidade
 * - Nao usa mocks de autenticacao — valida o fluxo completo
 */
import request from "supertest"
import app from "../app"

describe("Auth", () => {
  describe("POST /auth/login", () => {
    it("deve retornar token com credenciais validas", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "admin@climatech.com", password: "admin123" })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("token")
      expect(res.body).toHaveProperty("user")
      expect(res.body.user.email).toBe("admin@climatech.com")
    })

    it("deve retornar 401 com credenciais invalidas", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "admin@climatech.com", password: "senhaerrada" })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty("error")
    })

    it("deve retornar 400 com body invalido", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "nao-e-um-email" })

      expect(res.status).toBe(400)
    })
  })

  describe("GET /auth/me", () => {
    it("deve retornar dados do usuario autenticado", async () => {
      const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "admin@climatech.com", password: "admin123" })

      const token = loginRes.body.token

      const res = await request(app)
        .get("/auth/me")
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty("email", "admin@climatech.com")
    })

    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/auth/me")
      expect(res.status).toBe(401)
    })
  })
})
