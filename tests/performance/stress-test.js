import http from "k6/http"
import { check, sleep } from "k6"
import { Rate } from "k6/metrics"

const errorRate = new Rate("errors")

export const options = {
  scenarios: {
    stress: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 10  },
        { duration: "1m",  target: 50  },
        { duration: "1m",  target: 100 },
        { duration: "30s", target: 0   },
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    errors:            ["rate<0.10"],
    http_req_failed:   ["rate<0.10"],
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
  const healthOk = check(healthRes, {
    "health status 200": (r) => r.status === 200,
  })
  errorRate.add(!healthOk)

  const ticketsRes = http.get(`${BASE_URL}/tickets`, { headers })
  const ticketsOk = check(ticketsRes, {
    "tickets status 200": (r) => r.status === 200,
    "tickets response time < 2000ms": (r) => r.timings.duration < 2000,
  })
  errorRate.add(!ticketsOk)

  sleep(0.5)
}
