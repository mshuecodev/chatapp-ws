import { Request, Response, NextFunction } from "express"
import { getUserFromAccessToken, refreshSession } from "../services/auth.service"
import { setAuthCookies } from "../utils/cookies"

import { User } from "@supabase/supabase-js"

declare global {
	namespace Express {
		interface Request {
			user?: User
		}
	}
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessToken = req.cookies["sb-access-token"]
		const refreshToken = req.cookies["sb-refresh-token"]

		if (!accessToken) res.status(401).json({ message: "Not authenticated" })

		try {
			const user = await getUserFromAccessToken(accessToken)
			req.user = user
			next()
		} catch (err) {
			// Try refreshing
			if (!refreshToken) res.status(401).json({ message: "Session expired" })
			const newSession = await refreshSession(refreshToken)
			if (!newSession) res.status(401).json({ message: "Unable to refresh session" })

			// update cookies
			const headers = setAuthCookies(newSession.access_token, newSession.refresh_token)
			headers.forEach((h) => res.append("Set-Cookie", h))

			const user = await getUserFromAccessToken(newSession.access_token)
			req.user = user
			next()
		}
	} catch (error) {
		// console.error("Authentication error:", error)
		res.status(401).json({ message: "Unauthorized" })
	}
}
