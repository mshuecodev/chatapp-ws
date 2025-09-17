import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes"
import adminRoutes from "./routes/admin.routes"
import profileRoutes from "./routes/profile.routes"
import conversationRoutes from "./routes/conversation.routes"

dotenv.config()

const app = express()

// Middleware
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:8081",
		credentials: true
	})
)
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/sb/admin", adminRoutes)
app.use("/sb/profile", profileRoutes)
app.use("/sb/auth", authRoutes)
app.use("/sb/conversation", conversationRoutes)

// 404 handler
app.use((req, res) => {
	res.status(404).json({ message: "Route not found" })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error(err)
	res.status(err.status || 500).json({ message: err.message || "Internal server error" })
})

export default app
