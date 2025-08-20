import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()

app.use(
	cors({
		origin: process.env.CLIENT_URL, // frontend URL e.g. "http://localhost:3000"
		credentials: true // allow cookies and authorization headers
	})
)

app.use(express.json())
app.use(cookieParser())

app.use("/auth", authRoutes)

export default app
