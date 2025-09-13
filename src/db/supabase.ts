import { createClient } from "@supabase/supabase-js"
import { config } from "../config"

export const supabaseAdmin = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false, autoRefreshToken: false }
})

/**
 * Safely get a user from an access token. Returns user object or null.
 */
export async function getUserFromAccessToken(accessToken: string) {
	if (!accessToken) return null
	const token = accessToken.replace(/^Bearer\s+/i, "")
	try {
		const result = await supabaseAdmin.auth.getUser(token)
		if (result.error) return null
		return result.data.user ?? null
	} catch {
		return null
	}
}
