// import http from "http"
// import { Server } from "socket.io"
import app from "./app"
// import connectDB from "./config/db"
// import { saveMessage } from "./controllers/chat.controller"
// import { setupSocket } from "./services/socket.service"

// connectDB()

// const server = http.createServer(app)
// const io = new Server(server, {
// 	cors: { origin: "*" }
// })

// setupSocket(io)

const PORT = process.env.PORT || 4000
// server.listen(PORT, () => {
// 	console.log(`Server is running on port ${PORT}`)
// })

const server = app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`)
})

// graceful shutdown
process.on("SIGINT", () => {
	console.log("SIGINT received, shutting down")
	server.close(() => process.exit(0))
})
process.on("SIGTERM", () => {
	console.log("SIGTERM received, shutting down")
	server.close(() => process.exit(0))
})
