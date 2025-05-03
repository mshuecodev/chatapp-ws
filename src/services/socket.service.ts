import { Server } from "socket.io"
import { saveMessage } from "../controllers/chat.controller"

const userSocketMap = new Map<string, string[]>()

export const setupSocket = (io: Server) => {
	io.on("connection", (socket) => {
		console.log("User connected", socket.id)

		const userId = socket.handshake.query.userId as string

		if (userId) {
			const existingSockets = userSocketMap.get(userId) || []
			userSocketMap.set(userId, [...existingSockets, socket.id])
			console.log(`User ${userId} connected with socket ID: ${socket.id}`)
		}

		socket.on("sendMessage", async ({ sender, receiver, content }) => {
			console.log("Payload received:", { sender, receiver, content })

			const message = await saveMessage(sender, receiver, content)

			const receiverSocketIds = userSocketMap.get(receiver)

			console.log("Receiver", receiver)

			if (receiverSocketIds) {
				receiverSocketIds.forEach((socketId) => {
					io.to(socketId).emit("receiveMessage", { message })
				})
				console.log(`Message sent to ${receiver} with socket ID: ${receiverSocketIds.join(", ")}`)
			} else {
				console.log(`User ${receiver} is offline`)
			}
		})

		socket.on("disconnected", () => {
			console.log("User disconnected", socket.id)

			for (const [userId, socketIds] of userSocketMap.entries()) {
				const index = socketIds.indexOf(socket.id)

				if (index !== -1) {
					socketIds.splice(index, 1)

					if (socketIds.length === 0) {
						userSocketMap.delete(userId)
					} else {
						userSocketMap.set(userId, socketIds)
					}
					break
				}
			}
		})
	})
}
