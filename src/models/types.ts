// Minimal typed shapes — expand as you generate types from Supabase if desired
export type UUID = string

export interface Profile {
	id: UUID
	user_id: UUID
	display_name: string
	avatar_url?: string | null
	created_at: string
}

export interface Conversation {
	id: UUID
	is_group: boolean
	title?: string | null
	created_by: UUID
	created_at: string
}

export interface Message {
	id: UUID
	conversation_id: UUID
	sender_id: UUID
	body?: string | null
	has_attachments: boolean
	edited_at?: string | null
	deleted_at?: string | null
	created_at: string
}

export interface Attachment {
	id: UUID
	message_id: UUID
	bucket: string
	path: string
	mime_type?: string | null
	size_bytes?: number | null
	created_at: string
}
