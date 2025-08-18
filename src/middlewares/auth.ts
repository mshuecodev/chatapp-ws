// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from "express"
import { supabase } from "../config/supabase"

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const authHeader = req.headers.authorization

		if (!authHeader) {
			res.status(401).json({ error: "Authorization header missing" })
			return // stop execution
		}

		const token = authHeader.split(" ")[1]
		if (!token) {
			res.status(401).json({ error: "Token missing" })
			return
		}

		const { data, error } = await supabase.auth.getUser(token)

		if (error || !data?.user) {
			res.status(401).json({ error: "Invalid or expired token" })
			return
		}

		// Attach user to request for later use
		;(req as any).user = data.user

		next() // continue to the controller
	} catch (err) {
		console.error("Auth middleware error:", err)
		res.status(500).json({ error: "Internal server error" })
	}
}
