import { supabaseAdmin } from "../db/supabase"
import { Message } from "../models/types"

export async function isMember(conversationId: string, userId: string) {
	const { data, error } = await supabaseAdmin.from("conversation_members").select("*").eq("conversation_id", conversationId).eq("user_id", userId).limit(1).maybeSingle()
	if (error) throw error
	return !!data
}

export async function createMessage(conversationId: string, senderId: string, body?: string | null, has_attachments = false) {
	const { data, error } = await supabaseAdmin.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, body, has_attachments }).select("*").single()

	if (error) throw error
	return data as Message
}

export async function attachFiles(messageId: string, attachments: { bucket: string; path: string; mime_type?: string; size_bytes?: number }[]) {
	if (!attachments || !attachments.length) return
	const rows = attachments.map((a) => ({ message_id: messageId, ...a }))
	const { error } = await supabaseAdmin.from("attachments").insert(rows)
	if (error) throw error
}

export async function listMessages(conversationId: string, limit = 50, before?: string) {
	let query = supabaseAdmin.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(limit)

	if (before) {
		// expect ISO timestamp string for before
		query = query.lt("created_at", before)
	}

	const { data, error } = await query
	if (error) throw error
	return data as Message[]
}

export async function updateMessage(messageId: string, userId: string, newBody: string) {
	// Only sender may update: enforce with check
	const { data: msg, error: getErr } = await supabaseAdmin.from("messages").select("sender_id").eq("id", messageId).single()
	if (getErr) throw getErr
	if (!msg || msg.sender_id !== userId) {
		const e: any = new Error("Not authorized to edit message")
		e.status = 403
		throw e
	}

	const { data, error } = await supabaseAdmin.from("messages").update({ body: newBody, edited_at: new Date().toISOString() }).eq("id", messageId).select("*").single()

	if (error) throw error
	return data as Message
}

export async function softDeleteMessage(messageId: string, userId: string) {
	const { data: msg, error: getErr } = await supabaseAdmin.from("messages").select("sender_id").eq("id", messageId).single()
	if (getErr) throw getErr
	if (!msg || msg.sender_id !== userId) {
		const e: any = new Error("Not authorized to delete message")
		e.status = 403
		throw e
	}
	const { data, error } = await supabaseAdmin.from("messages").update({ deleted_at: new Date().toISOString() }).eq("id", messageId).select("*").single()
	if (error) throw error
	return data as Message
}
