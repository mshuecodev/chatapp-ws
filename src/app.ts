import express, { Request, Response } from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import pinoHttp from "pino-http"
import helmet from "helmet"
import rateLimit from "express-rate-limit"

import authRoutes from "./routes/auth.routes"
import conversationsRoutes from "./routes/conversation.routes"
import messagesRoutes from "./routes/message.routes"
import uploadsRoutes from "./routes/upload.routes"

dotenv.config()

const app = express()

// Middlewares
app.use(helmet())
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(
	cors({
		origin: process.env.CLIENT_URL, // frontend URL e.g. "http://localhost:3000"
		credentials: true // allow cookies and authorization headers
	})
)

app.use(pinoHttp()) // logs request info
app.use(cookieParser())

const limiter = rateLimit({
	windowMs: 10 * 1000, // 10s window for example (tweak)
	max: 50,
	standardHeaders: true,
	legacyHeaders: false
})
app.use(limiter)

app.use("/auth", authRoutes)
app.use("/conversations", conversationsRoutes)
app.use("/messages", messagesRoutes)
app.use("/uploads", uploadsRoutes)

app.get("/health", (_req: Request, res: Response) => {
	res.json({ ok: true })
})

export default app
