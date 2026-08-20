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

})