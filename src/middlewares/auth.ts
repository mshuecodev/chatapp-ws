import { Request, Response, NextFunction } from "express"
import { supabase, supabaseAdmin } from "../config/supabase"

export interface AuthUser {
	id: string
	email?: string
	roles: string[]
}

declare global {
	namespace Express {
		interface Request {
			authUser?: AuthUser
		}
	}
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const header = req.headers["authorization"]
		if (!header) {
			res.status(401).json({ message: "No token provided!" })
			return
		}

		const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header
		if (!token) {
			res.status(401).json({ message: "Invalid authorization header!" })
			return
		}

		const { data, error } = await supabase.auth.getUser(token)
		if (error || !data.user) {
			res.status(401).json({ message: "Invalid or expired token!" })
			return
		}

		const user = data.user
		const { data: rolesData, error: rolesError } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id)

		if (rolesError) {
			console.error("Role fetch error:", rolesError)
			res.status(500).json({ message: "Failed to fetch roles!" })
			return
		}

		req.authUser = {
			id: user.id,
			email: user.email,
			roles: rolesData?.map((r) => r.role) || []
		}

		next()
	} catch (error) {
		console.error("Authentication error:", error)
		res.status(500).json({ message: "Authentication failed!" })
	}
}
