import { Request, Response } from "express"
import { z } from "zod"
import { supabaseAdmin } from "../config/supabase"
import { Profile, Conversation, ConversationMember, ConversationEntry, Message } from "../utils/types"

export class ConversationController {
	// Create a new conversation (group or private)
	static async createConversation(req: Request, res: Response) {
		try {
			const schema = z.object({
				title: z.string().optional(),
				memberIds: z.array(z.string().uuid()).min(1), // must include at least 1 user
				isGroup: z.boolean().default(false)
			})

			const parsed = schema.safeParse(req.body)
			if (!parsed.success) {
				return res.status(400).json({ error: parsed.error.flatten() })
			}
			console.log("BODY", parsed)

			const creatorId = req.authUser?.id
			if (!creatorId) {
				return res.status(401).json({ message: "Not authenticated" })
			}

			const { title, memberIds, isGroup } = parsed.data

			// ✅ Check if 1-on-1 conversation already exists
			if (!isGroup && memberIds.length === 1) {
				const otherId = memberIds[0]
				const { data: existing, error: existingErr } = await supabaseAdmin.from("conversations").select("id, is_group, conversation_members(user_id)").eq("is_group", false)

				if (existingErr) throw existingErr

				const match = existing?.find((c) => {
					const members = c.conversation_members.map((m) => m.user_id)
					return members.length === 2 && members.includes(creatorId) && members.includes(otherId)
				})

				if (match) {
					return res.status(200).json({ conversation: match })
				}
			}

			// ✅ Create new conversation
			const { data: convo, error: convoErr } = await supabaseAdmin
				.from("conversations")
				.insert({
					is_group: isGroup,
					title: isGroup ? title : null,
					created_by: creatorId
				})
				.select()
				.single()

			if (convoErr) {
				return res.status(500).json({ message: convoErr.message })
			}

			// ✅ Insert members
			const members = [{ conversation_id: convo.id, user_id: creatorId, role: "owner" }, ...memberIds.map((id) => ({ conversation_id: convo.id, user_id: id, role: "member" }))]

			console.log("members", members)

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

	// List conversations for authenticated user
	// static async getConversations(req: Request, res: Response) {
	// 	try {
	// 		const userId = req.authUser?.id
	// 		if (!userId) {
	// 			return res.status(401).json({ message: "Not authenticated" })
	// 		}

	// 		const { data: conversations, error } = await supabaseAdmin
	// 			.from("conversations")
	// 			.select(
	// 				`
	// 				id,
	// 				is_group,
	// 				title,
	// 				created_at,
	// 				conversation_members(
	// 					user_id,
	// 					role,
	// 					joined_at,
	// 					profiles(full_name, avatar_url)

	// 				),
	// 				messages(
	// 					id,
	// 					body,
	// 					created_at
	// 				)
	// 			`
	// 			)
	// 			.order("created_at", { ascending: false })
	// 			.returns<Conversation[]>()

	// 		if (error) throw error

	// 		// ✅ Format conversations for frontend
	// 		const result = conversations.map((c) => {
	// 			if (c.is_group) {
	// 				return {
	// 					id: c.id,
	// 					title: c.title,
	// 					lastMessage: c.messages?.[0]?.body || null,
	// 					members: c.conversation_members.map((m) => ({
	// 						id: m.user_id,
	// 						name: m.profiles.full_name,
	// 						avatar: m.profiles.avatar_url
	// 					}))
	// 				}
	// 			} else {
	// 				const other = c.conversation_members.find((m) => m.user_id !== userId)
	// 				return {
	// 					id: c.id,
	// 					title: other?.profiles.full_name || "Unknown",
	// 					avatar: other?.profiles.avatar_url || null,
	// 					lastMessage: c.messages?.[0]?.body || null
	// 				}
	// 			}
	// 		})

	// 		res.status(200).json({ conversations: result })
	// 	} catch (error) {
	// 		console.error("Error fetching conversations:", error)
	// 		res.status(500).json({ message: "Failed to fetch conversations" })
	// 	}
	// }

	// Get signed upload URL for attachments
	static async signAttachmentUrl(req: Request, res: Response) {
		try {
			const convoId = req.params.id
			const userId = req.authUser?.id
			if (!userId) {
				return res.status(401).json({ message: "Not authenticated" })
			}

			// ✅ Validate membership
			const { data: member, error: memberError } = await supabaseAdmin.from("conversation_members").select("conversation_id").eq("conversation_id", convoId).eq("user_id", userId).single()

			if (memberError || !member) {
				return res.status(403).json({ message: "Not a member" })
			}

			// ✅ Generate signed upload URL
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

	static async getConversations(req: Request, res: Response) {
		try {
			const userId = req.authUser?.id
			if (!userId) {
				return res.status(401).json({ message: "Not authenticated" })
			}

			const { data: conversations, error } = await supabaseAdmin
				.from("conversations")
				.select(
					`
				id,
				is_group,
				title,
				created_at,
				conversation_members (
					user_id,
					role,
					joined_at,
					profiles (
						display_name,
						avatar_url
					)
				),
				messages!messages_conversation_id_fkey (
					id,
					body,
					created_at
				)
			`
				)
				.eq("conversation_members.user_id", userId) // only conversations the user is in
				.order("created_at", { ascending: false })
				// 👇 limit messages to the latest one
				.limit(1, { foreignTable: "messages" })
				.returns<any>() // define a Conversation type if you want

			if (error) throw error

			// ✅ Format conversations for frontend
			const result = conversations.map((c: any) => {
				if (c.is_group) {
					return {
						id: c.id,
						title: c.title,
						lastMessage: c.messages?.[0]?.body || null,
						members: c.conversation_members.map((m: any) => ({
							id: m.user_id,
							name: m.profiles.display_name,
							avatar: m.profiles.avatar_url
						}))
					}
				} else {
					const other = c.conversation_members.find((m: any) => m.user_id !== userId)
					return {
						id: c.id,
						title: other?.profiles.display_name || "Unknown",
						avatar: other?.profiles.avatar_url || null,
						lastMessage: c.messages?.[0]?.body || null
					}
				}
			})

			res.status(200).json({ conversations: result })
		} catch (error) {
			console.error("Error fetching conversations:", error)
			res.status(500).json({ message: "Failed to fetch conversations" })
		}
	}
}
