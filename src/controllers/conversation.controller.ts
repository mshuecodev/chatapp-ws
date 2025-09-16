import { Request, Response } from "express"
import { z } from "zod"
import { supabaseAdmin } from "../config/supabase"

export class ConversationController {
	static async createConversation(req: Request, res: Response) {
		try {
			const schema = z.object({
				title: z.string().min(1),
				memberIds: z.array(z.string().uuid()).min(1) //user_ids
			})
			const parsed = schema.safeParse(req.body)
			if (!parsed.success) {
				return res.status(400).json({ error: parsed.error.flatten() })
			}

			const creatorId = req.authUser?.id
			if (!creatorId) {
				return res.status(401).json({ message: "Not authenticated" })
			}

			const { title, memberIds } = parsed.data

			const { data: convo, error: convoErr } = await supabaseAdmin.from("conversations").insert({ is_group: true, title, created_by: creatorId }).select().single()

			if (convoErr) {
				return res.status(500).json({ message: convoErr.message })
			}

			const members = [{ conversation_id: convo.id, user_id: creatorId, role: "owner" }, ...memberIds.map((id) => ({ conversation_id: convo.id, user_id: id }))]

			const { error: memErr } = await supabaseAdmin.from("conversation_members").insert(members)

			if (memErr) {
				return res.status(500).json({ message: memErr.message })
			}

			res.status(201).json({ conversation: convo })
		} catch (error) {
			console.error("Error creating conversation:", error)
			res.status(500).json({ message: "Failed to create conversation" })
		}
	}

	static async signAttachmentUrl(req: Request, res: Response) {
		try {
			const convoId = req.params.id
			const userId = req.authUser?.id
			if (!userId) {
				return res.status(401).json({ message: "Not authenticated" })
			}

			// Validate membership
			const { data: member, error: memberError } = await supabaseAdmin.from("conversation_members").select("conversation_id").eq("conversation_id", convoId).eq("user_id", userId).single()

			if (memberError || !member) {
				return res.status(403).json({ message: "Not a member" })
			}

			// Generate signed upload URL
			const filePath = `${convoId}/${userId}/${crypto.randomUUID()}`
			const { data, error } = await supabaseAdmin.storage.from("chat-attachments").createSignedUploadUrl(filePath)

			if (error) {
				return res.status(500).json({ message: error.message })
			}
			res.status(200).json({ uploadUrl: data.signedUrl, path: filePath })
		} catch (error) {
			console.error("Error signing attachment URL:", error)
			res.status(500).json({ message: "Failed to sign attachment URL" })
		}
	}
}
