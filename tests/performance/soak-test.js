import http from "k6/http"
import { check, sleep } from "k6"
import { Rate, Trend } from "k6/metrics"

const errorRate = new Rate("errors")
const responseTrend = new Trend("response_time")

export const options = {
  scenarios: {
    soak: {
      executor: "ramping-vus",
      stages: [
        { duration: "2m",  target: 10 },
        { duration: "25m", target: 10 },
        { duration: "3m",  target: 0  },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    errors:            ["rate<0.05"],
    http_req_failed:   ["rate<0.05"],
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

  const healthRes = http.get(`${BASE_URL}/health`)
  check(healthRes, {
    "health status 200": (r) => r.status === 200,
  })

  const ticketsRes = http.get(`${BASE_URL}/tickets`, { headers })
  const ticketsOk = check(ticketsRes, {
    "tickets status 200": (r) => r.status === 200,
    "tickets response time < 1000ms": (r) => r.timings.duration < 1000,
  })
  responseTrend.add(ticketsRes.timings.duration)
  errorRate.add(!ticketsOk)

  const customersRes = http.get(`${BASE_URL}/customers`, { headers })
  check(customersRes, {
    "customers status 200": (r) => r.status === 200,
  })

  sleep(1)
}
