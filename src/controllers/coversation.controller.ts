import { Request, Response } from "express"
import * as convService from "../services/conversation.service"
import { asyncHandler } from "../utils/http"
import { requireUser } from "../middlewares/requireUser"

export const createConversation = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!
	const { title, memberIds } = req.body as { title?: string | null; memberIds: string[] }
	const convo = await convService.createConversation(user.id, title ?? null, memberIds || [])
	res.status(201).json(convo)
})

export const listConversations = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!
	const convos = await convService.listConversationsForUser(user.id)
	res.json(convos)
})
