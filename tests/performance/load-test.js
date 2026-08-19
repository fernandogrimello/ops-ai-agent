import http from "k6/http"
import { check, sleep } from "k6"
import { Rate, Trend } from "k6/metrics"

const errorRate = new Rate("errors")
const ticketDuration = new Trend("ticket_duration")

export const options = {
  stages: [
    { duration: "30s", target: 10 },  // ramp up para 10 usuarios
    { duration: "1m",  target: 10 },  // mantém 10 usuarios por 1 minuto
    { duration: "30s", target: 0  },  // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],  // 95% das requests abaixo de 500ms
    errors:            ["rate<0.05"],  // menos de 5% de erros
    http_req_failed:   ["rate<0.05"],  // menos de 5% de falhas HTTP
  },
}

const BASE_URL = "http://localhost:3001"

function getToken() {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: "admin@climatech.com", password: "admin123" }),
    { headers: { "Content-Type": "application/json" } }
  )
  return res.json("token")
}

export function setup() {
  return { token: getToken() }
}

export default function (data) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${data.token}`,
  }

  // Teste 1: Health check
  const healthRes = http.get(`${BASE_URL}/health`)
  check(healthRes, {
    "health status 200": (r) => r.status === 200,
    "health response time < 100ms": (r) => r.timings.duration < 100,
  })

  // Teste 2: Listar tickets
  const start = Date.now()
  const ticketsRes = http.get(`${BASE_URL}/tickets`, { headers })
  ticketDuration.add(Date.now() - start)

  const ticketsOk = check(ticketsRes, {
    "tickets status 200": (r) => r.status === 200,
    "tickets é array": (r) => Array.isArray(r.json()),
    "tickets response time < 500ms": (r) => r.timings.duration < 500,
  })
  errorRate.add(!ticketsOk)

  // Teste 3: Listar clientes
  const customersRes = http.get(`${BASE_URL}/customers`, { headers })
  check(customersRes, {
    "customers status 200": (r) => r.status === 200,
    "customers response time < 500ms": (r) => r.timings.duration < 500,
  })

  sleep(1)
}
