import { Request, Response } from "express"
import { asyncHandler } from "../utils/http"
import * as uploadService from "../services/upload.service"

export const signUpload = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!
	const { conversationId, filename } = req.body as { conversationId: string; filename: string }

	// membership check (reuse messages isMember)
	const isMember = await (await import("../services/messagees.service")).isMember(conversationId, user.id)
	if (!isMember) return res.status(403).json({ error: "Not a conversation member" })

	const result = await uploadService.createSignedUpload(conversationId, user.id, filename)
	res.json(result)
})

export const signDownload = asyncHandler(async (req: Request, res: Response) => {
	const user = req.user!
	const { path } = req.body as { path: string }

	// Quick access check: ensure attachment -> message -> conversation -> member
	const { data: attachment, error } = await (await import("../db/supabase")).supabaseAdmin.from("attachments").select("message_id, bucket, path").eq("path", path).maybeSingle()

	if (error || !attachment) return res.status(404).json({ error: "Attachment not found" })

	const { data: msgRow, error: msgErr } = await (await import("../db/supabase")).supabaseAdmin.from("messages").select("conversation_id").eq("id", attachment.message_id).maybeSingle()

	if (msgErr || !msgRow) return res.status(404).json({ error: "Message not found" })

	const isMember = await (await import("../services/messagees.service")).isMember(msgRow.conversation_id, user.id)
	if (!isMember) return res.status(403).json({ error: "Not allowed" })

	const signed = await uploadService.createSignedDownload(path)
	res.json(signed)
})
