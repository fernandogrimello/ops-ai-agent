import express from "express"
import helmet from "helmet"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import customerRoutes from "./routes/customer.routes"
import ticketRoutes from "./routes/ticket.routes"
import agentRoutes from "./routes/agent.routes"

dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/auth", authRoutes)
app.use("/customers", customerRoutes)
app.use("/tickets", ticketRoutes)
app.use("/agent", agentRoutes)

export default app
