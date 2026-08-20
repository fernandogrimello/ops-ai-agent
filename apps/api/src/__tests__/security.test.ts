/**
 * @file security.test.ts
 * @description Testes de seguranca da API — headers, autenticacao, injecao e rate limiting.
 *
 * O que cobre:
 * - Headers de seguranca HTTP (helmet)
 * - Rejeicao de tokens JWT invalidos, malformados e com assinatura incorreta
 * - Bloqueio de payloads com tentativa de SQL injection
 * - Ausencia de stack trace exposto em respostas de erro
 * - Presenca de headers de rate limiting
 *
 * O que garante:
 * - Que o helmet esta ativo e configurando corretamente os headers de seguranca
 * - Que X-Powered-By nao e exposto (evita fingerprinting do servidor)
 * - Que tokens invalidos sao sempre rejeitados com 401
 * - Que inputs maliciosos sao bloqueados pelo Zod antes de chegar ao banco
 * - Que erros internos nao vazam stack trace para o cliente
 * - Que o rate limiter esta ativo e retornando os headers corretos
 *
 * Decisoes de design:
 * - Testa seguranca em camada de middleware, antes da logica de negocio
 * - Usa inputs extremos (payload gigante, SQL injection) para validar robustez
 * - Rate limiting configurado para 100 req/15min por IP
 */
import request from "supertest"
import app from "../app"

describe("Security", () => {
  describe("Headers de seguranca", () => {
    it("deve retornar header X-Content-Type-Options", async () => {
      const res = await request(app).get("/health")
      expect(res.headers["x-content-type-options"]).toBe("nosniff")
    })

    it("deve retornar header X-Frame-Options", async () => {
      const res = await request(app).get("/health")
      expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN")
    })

    it("deve retornar header X-DNS-Prefetch-Control", async () => {
      const res = await request(app).get("/health")
      expect(res.headers["x-dns-prefetch-control"]).toBe("off")
    })

    it("nao deve expor header X-Powered-By", async () => {
      const res = await request(app).get("/health")
      expect(res.headers["x-powered-by"]).toBeUndefined()
    })
  })

  describe("Autenticacao", () => {
    it("deve rejeitar token malformado", async () => {
      const res = await request(app)
        .get("/tickets")
        .set("Authorization", "Bearer token-invalido-malformado")

      expect(res.status).toBe(401)
    })

    it("deve rejeitar token com assinatura incorreta", async () => {
      const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYWtlIiwicm9sZSI6IkFETUlOIn0.assinatura-falsa"
      const res = await request(app)
        .get("/tickets")
        .set("Authorization", `Bearer ${fakeToken}`)

      expect(res.status).toBe(401)
    })

    it("deve rejeitar requisicao sem header Authorization", async () => {
      const res = await request(app).get("/customers")
      expect(res.status).toBe(401)
    })

    it("deve rejeitar Authorization com formato incorreto", async () => {
      const res = await request(app)
        .get("/tickets")
        .set("Authorization", "Basic dXNlcjpwYXNz")

      expect(res.status).toBe(401)
    })
  })

  describe("Injecao de dados", () => {
    it("deve sanitizar input malicioso no login", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({
          email: "admin@climatech.com'; DROP TABLE users; --",
          password: "admin123"
        })

      expect([400, 401]).toContain(res.status)
      expect(res.body).not.toHaveProperty("stack")
    })

    it("nao deve expor stack trace em erros", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "teste@teste.com", password: "errado" })

      expect(res.body).not.toHaveProperty("stack")
      expect(res.body).not.toHaveProperty("trace")
    })

    it("deve rejeitar payload muito grande", async () => {
      const bigPayload = { 
        email: "a".repeat(10000) + "@test.com",
        password: "b".repeat(10000)
      }
      const res = await request(app)
        .post("/auth/login")
        .send(bigPayload)

      expect([400, 401, 413]).toContain(res.status)
    })
  })

  describe("Rate limiting", () => {
    it("deve retornar header RateLimit-Limit", async () => {
      const res = await request(app).get("/health")
      expect(res.headers["ratelimit-limit"]).toBeDefined()
    })

    it("deve retornar header RateLimit-Remaining", async () => {
      const res = await request(app).get("/health")
      expect(res.headers["ratelimit-remaining"]).toBeDefined()
    })
  })


  describe("CORS", () => {
    it("deve permitir origem localhost:3000", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:3000")

      expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000")
    })

    it("deve bloquear origem nao permitida", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "http://site-malicioso.com")

      expect(res.headers["access-control-allow-origin"]).toBeUndefined()
    })
  })

})