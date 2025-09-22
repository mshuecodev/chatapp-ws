import { Request, Response } from "express"

import { z } from "zod"
import { supabaseAdmin } from "../config/supabase"
const uuidSchema = z.string().uuid()

export class MessageController {
	// ✅ Send message
	static async sendMessage(req: Request, res: Response) {
		try {
			const schema = z.object({
				conversationId: z.string().uuid(),
				content: z.string().optional(),
				attachmentId: z.string().uuid().optional()
			})
			const parsed = schema.safeParse(req.body)
			if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

			const senderId = req.authUser?.id
			if (!senderId) return res.status(401).json({ message: "Not authenticated" })

			const { conversationId, content, attachmentId } = parsed.data

			// Check membership
			const { data: member, error: memErr } = await supabaseAdmin.from("conversation_members").select("id").eq("conversation_id", conversationId).eq("user_id", senderId).single()

			if (memErr || !member) return res.status(403).json({ message: "Not a member" })

			// Insert message
			const { data: msg, error } = await supabaseAdmin.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, content, attachment_id: attachmentId }).select().single()

			if (error) return res.status(500).json({ message: error.message })

			res.status(201).json({ message: msg })
		} catch (error) {
			console.error("Error sending message:", error)
			res.status(500).json({ message: "Failed to send message" })
		}
	}

	// ✅ Get messages in a conversation
	static async getMessages(req: Request, res: Response) {
		try {
			const userId = req.authUser?.id
			const parsed = uuidSchema.safeParse(req.params.id)

			console.log("parsed", parsed, parsed)

			if (!parsed.success) {
				return res.status(400).json({ message: "Invalid conversation ID" })
			}
			const convoId = parsed.data

			if (!userId) return res.status(401).json({ message: "Not authenticated" })

			console.log("check ids", convoId, userId)
			// Membership check
			const { data: member, error: memErr } = await supabaseAdmin
				.from("conversation_members")

				.select("conversation_id, user_id")
				.eq("conversation_id", convoId)
				.eq("user_id", userId)
				.maybeSingle()

			console.log("check member", member, memErr)

			if (memErr || !member) return res.status(403).json({ message: "Not a member" })

			// Fetch messages
			const { data, error } = await supabaseAdmin
				.from("messages")
				.select(
					`
						id,
						body,
						created_at,
						sender:profiles(id, display_name, avatar),
						attachment:attachments(path, mime_type)
						`
				)
				.eq("conversation_id", convoId)
				.order("created_at", { ascending: true })

			if (error) return res.status(500).json({ message: error.message })

			// Mark messages as read
			const readRecords = data.map((m) => ({ message_id: m.id, user_id: userId }))
			if (readRecords.length > 0) {
				await supabaseAdmin.from("message_reads").upsert(readRecords, { onConflict: "message_id,user_id" })
			}

			res.status(200).json({ messages: data })
		} catch (error) {
			console.error("Error fetching messages:", error)
			res.status(500).json({ message: "Failed to fetch messages" })
		}
	}
}
