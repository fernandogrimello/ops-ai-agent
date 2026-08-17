import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import customerRoutes from "./routes/customer.routes"
import ticketRoutes from "./routes/ticket.routes"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/auth", authRoutes)
app.use("/customers", customerRoutes)
app.use("/tickets", ticketRoutes)

export default app
