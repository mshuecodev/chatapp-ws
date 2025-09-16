import http from "http"
import app from "./app"

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000

const server = http.createServer(app)

server.listen(PORT, () => {
	console.log(`🚀 Server is running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
	console.info("SIGTERM signal received. Closing server...")
	server.close(() => {
		console.log("Server closed gracefully.")
		process.exit(0)
	})
})

process.on("SIGINT", () => {
	console.info("SIGINT signal received. Closing server...")
	server.close(() => {
		console.log("Server closed gracefully.")
		process.exit(0)
	})
})
