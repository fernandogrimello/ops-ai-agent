import express from "express"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import customerRoutes from "./routes/customer.routes"
import ticketRoutes from "./routes/ticket.routes"
import agentRoutes from "./routes/agent.routes"

dotenv.config()

const app = express()

app.use(helmet())

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/auth", authRoutes)
app.use("/customers", customerRoutes)
app.use("/tickets", ticketRoutes)
app.use("/agent", agentRoutes)

export default app
