import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  console.log(req.method, req.path, req.body)
  next()
})

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

app.use("/auth", authRoutes)

export default app
