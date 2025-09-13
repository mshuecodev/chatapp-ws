import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes"
import adminRoutes from "./routes/admin.routes"
import profileRoutes from "./routes/profile.routes"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/auth", authRoutes)
app.use("/admin", adminRoutes)
app.use("/profile", profileRoutes)

export default app
