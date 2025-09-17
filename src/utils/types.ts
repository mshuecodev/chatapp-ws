export type Profile = {
	id: string
	user_id: string
	email: string | null
	display_name: string
	avatar_url: string | null
	created_at: string
	full_name: string | null
}

export type MemberProfile = {
	full_name: string | null
	avatar_url: string | null
}

export type ConversationMember = {
	// user: Profile
	conversation_id: string
	user_id: string
	role: string
	joined_at: string
	profiles: MemberProfile
}
export type ConversationMemberWithProfile = {
	user_id: string
	profiles: {
		full_name: string | null
		avatar_url: string | null
	}
}

export type Message = {
	id: string
	conversation_id: string
	sender_id: string
	body: string
	has_attachment: boolean
	edited_at: string
	delete_at: string
	created_at: string
}

export type Conversation = {
	id: string
	title: string | null
	is_group: boolean
	created_at: string
	created_by: string
	messages: Message[]
	conversation_members: ConversationMember[]
}

export type ConversationEntry = {
	conversation_id: string
	conversations: Conversation
}
