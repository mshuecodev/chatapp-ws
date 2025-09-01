import { supabaseAdmin } from "../db/supabase"
import { Conversation } from "../models/types"

export async function createConversation(createdBy: string, title: string | null, memberIds: string[]) {
	// create conversation
	const { data: convo, error: convoErr } = await supabaseAdmin
		.from("conversations")
		.insert({ is_group: memberIds.length > 1, title, created_by: createdBy })
		.select("*")
		.single()

	if (convoErr) throw convoErr

	// insert members (include creator)
	const members = [{ conversation_id: convo.id, user_id: createdBy, role: "owner" }, ...memberIds.filter((id) => id !== createdBy).map((id) => ({ conversation_id: convo.id, user_id: id, role: "member" }))]
	const { error: memErr } = await supabaseAdmin.from("conversation_members").insert(members)
	if (memErr) throw memErr

	return convo as Conversation
}

export async function listConversationsForUser(userId: string) {
	// Fetch conversation IDs then fetch conversations with profile info
	const { data: rows, error } = await supabaseAdmin.from("conversation_members").select("conversation_id").eq("user_id", userId)

	if (error) throw error
	const convoIds = (rows || []).map((r: any) => r.conversation_id)
	if (!convoIds.length) return []

	const { data: convos, error: convErr } = await supabaseAdmin.from("conversations").select("*").in("id", convoIds).order("created_at", { ascending: false })

	if (convErr) throw convErr
	return convos as Conversation[]
}
