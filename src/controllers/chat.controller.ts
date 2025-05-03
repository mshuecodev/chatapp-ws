import Message from "../models/Message"

export const saveMessage = async (sender: string, receiver: string, content: string) => {
	try {
		const message = new Message({
			sender,
			receiver,
			content,
			timestamp: new Date()
		})
		let result = await message.save()
		return result
	} catch (error) {
		throw new Error("Error saving message: " + error)
	}
}
