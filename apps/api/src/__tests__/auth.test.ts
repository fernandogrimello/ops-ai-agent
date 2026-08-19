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
