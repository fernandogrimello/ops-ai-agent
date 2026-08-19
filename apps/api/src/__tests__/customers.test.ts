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
          phone: "61999999999",
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
      const res = await request(app)
        .post("/customers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Joao Silva",
          email: "joao@empresa.com",
          phone: "61999999999",
          company: "Empresa ABC"
        })

      // Tenta criar de novo com mesmo email
      const res2 = await request(app)
        .post("/customers")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Joao Silva",
          email: "joao@empresa.com",
          phone: "61999999999",
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
