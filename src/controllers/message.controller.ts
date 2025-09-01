import { Request, Response } from "express"
import * as msgService from "../services/messagees.service"
import * as uploadService from "../services/upload.service"
import { asyncHandler } from "../utils/http"
import { requireAuth } from "../middlewares/auth"

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!
	const { conversationId, body, attachments } = req.body as {
		conversationId: string
		body?: string
		attachments?: { path: string; bucket?: string; mime_type?: string; size_bytes?: number }[]
	}

	// membership check
	const member = await msgService.isMember(conversationId, user.id)
	if (!member) return res.status(403).json({ error: "Not a conversation member" })

	const message = await msgService.createMessage(conversationId, user.id, body ?? null, !!(attachments && attachments.length))
	if (attachments && attachments.length) {
		// attachments should already be uploaded by client to storage; we only record metadata
		await msgService.attachFiles(
			message.id,
			attachments.map((a) => ({ bucket: a.bucket ?? (process.env.CHAT_ATTACHMENTS_BUCKET || "chat-attachments"), path: a.path, mime_type: a.mime_type, size_bytes: a.size_bytes }))
		)
	}

	res.status(201).json(message)
})

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!
	const conversationId = req.params.conversationId
	const limit = Math.min(100, Number(req.query.limit ?? 50))
	const before = req.query.before as string | undefined

	const isMember = await msgService.isMember(conversationId, user.id)
	if (!isMember) return res.status(403).json({ error: "Not a conversation member" })

	const messages = await msgService.listMessages(conversationId, limit, before)
	res.json(messages)
})

export const editMessage = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!
	const { messageId } = req.params
	const { body } = req.body as { body: string }
	const updated = await msgService.updateMessage(messageId, user.id, body)
	res.json(updated)
})

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!
	const { messageId } = req.params
	const deleted = await msgService.softDeleteMessage(messageId, user.id)
	res.json({ success: true, message: deleted })
})
