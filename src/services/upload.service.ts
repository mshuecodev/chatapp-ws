import crypto from "crypto"
import { supabaseAdmin } from "../db/supabase"
import { config } from "../config"

const BUCKET = config.CHAT_ATTACHMENTS_BUCKET

export async function createSignedUpload(conversationId: string, userId: string, filename: string, expiresInSeconds = Number(60 * 10)) {
	const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")
	const filePath = `${conversationId}/${userId}/${crypto.randomUUID()}-${safeName}`

	const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(filePath)

	if (error) throw error
	// data: { signedUrl, path }
	return { uploadUrl: data.signedUrl, path: filePath }
}

export async function createSignedDownload(path: string, expiresInSeconds = 60 * 60) {
	const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds)

	if (error) throw error
	return { downloadUrl: data.signedUrl, path }
}
