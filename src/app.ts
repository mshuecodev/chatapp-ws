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

app.use("/auth", authRoutes) //mongodb

// supabase routes
app.use("/sb/admin", adminRoutes) //supabase
app.use("/sb/profile", profileRoutes) //supabase

export default app
