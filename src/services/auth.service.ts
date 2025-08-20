import { supabase } from "../config/supabase"
import { BadRequest, Unauthorized } from "../utils/errors"

export const signUpWithEmail = async (email: string, password: string) => {
	const { data, error } = await supabase.auth.signUp({ email, password })
	if (error) throw BadRequest("Sign up failed", error)
	console.log("signUpWithEmail data:", data)
	return data
}

export const signInWithEmail = async (email: string, password: string) => {
	const { data, error } = await supabase.auth.signInWithPassword({ email, password })
	if (error) {
		console.log("Sign in error:", error)
		throw Unauthorized("Invalid credentials")
	}
	console.log("signInWithEmail data:", data)
	return data // contains session (access_token, refresh_token)
}

export const refreshSession = async (refreshToken: string) => {
	const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
	if (error || !data.session) throw Unauthorized("Refresh failed")
	return data.session
}

// export const signOut = async (accessToken: string) => {
// 	// Supabase requires the access token to revoke refresh tokens of the session
// 	const { error } = await supabase.auth.signOut({ scope: "global" })
// 	// Note: signOut() relies on the current client session; when using server client, it
// 	// will still succeed but won’t target a specific user token. We clear cookies regardless.
// 	if (error) throw BadRequest("Sign out failed", error)
// }

export const getUserFromAccessToken = async (accessToken: string) => {
	const { data, error } = await supabase.auth.getUser(accessToken)
	if (error || !data.user) throw Unauthorized()
	return data.user
}
