import type { Request, Response } from "express"
import { asyncHandler } from "../utils/http"
import { setAuthCookies, clearAuthCookies } from "../utils/cookies"
import { signInWithEmail, signUpWithEmail, refreshSession, signOut } from "../services/auth.service"

export const postSignUp = asyncHandler(async (req: Request, res: Response) => {
	const { email, password } = req.body as { email?: string; password?: string }
	if (!email || !password) return res.status(400).json({ message: "email and password required" })

	const { user } = await signUpWithEmail(email, password)
	// Depending on your Supabase email confirmation settings, a session may not be returned here.
	return res.status(201).json({ user })
})

export const postSignIn = asyncHandler(async (req: Request, res: Response) => {
	const { email, password } = req.body as { email?: string; password?: string }
	if (!email || !password) return res.status(400).json({ message: "email and password required" })

	const { session, user } = await signInWithEmail(email, password)
	if (!session) return res.status(401).json({ message: "No session" })

	const headers = setAuthCookies(session.access_token, session.refresh_token)
	headers.forEach((h) => res.append("Set-Cookie", h))
	return res.json({ user })
})

export const postRefresh = asyncHandler(async (req: Request, res: Response) => {
	const refreshToken = (req.cookies?.["sb-refresh-token"] as string) || (req.body?.refresh_token as string)
	if (!refreshToken) return res.status(400).json({ message: "missing refresh token" })

	const newSession = await refreshSession(refreshToken)
	const headers = setAuthCookies(newSession.access_token, newSession.refresh_token)
	headers.forEach((h) => res.append("Set-Cookie", h))
	return res.json({ ok: true })
})

export const postSignOut = asyncHandler(async (req: Request, res: Response) => {
	const accessToken = (req.cookies?.["sb-access-token"] as string) || (req.headers.authorization?.split(" ")[1] ?? "")
	try {
		if (accessToken) await signOut(accessToken)
	} finally {
		clearAuthCookies().forEach((h) => res.append("Set-Cookie", h))
	}
	return res.json({ ok: true })
})
