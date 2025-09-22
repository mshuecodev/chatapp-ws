import { Request, Response } from "express"
import { supabase, supabaseAdmin } from "../config/supabase"

export class AdminController {
	static async createUser(req: Request, res: Response) {
		try {
			const { email, password, roles } = req.body

			if (!email || !password || !Array.isArray(roles)) {
				return res.status(400).json({ message: "Invalid input" })
			}

			const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
				email,
				password,
				email_confirm: false
			})

			if (userError) {
				return res.status(400).json({ message: userError.message })
			}

			const userId = userData.user?.id
			if (!userId) {
				return res.status(500).json({ message: "User ID not found after creation" })
			}

			await supabaseAdmin.from("profiles").insert({ id: userId, email })
			await supabaseAdmin.from("user_roles").insert(roles.map((role: string) => ({ user_id: userId, role })))

			res.status(201).json({ message: "User created successfully", userId })
		} catch (error) {
			console.error("Error creating user:", error)
			res.status(500).json({ message: "Failed to create user" })
		}
	}

	static async assignRole(req: Request, res: Response) {
		try {
			const { userId, role } = req.body
			if (!userId || !role) {
				return res.status(400).json({ message: "Invalid input" })
			}

			const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: userId, role })
			if (error) {
				return res.status(400).json({ message: error.message })
			}

			res.status(200).json({ message: "Role assigned successfully" })
		} catch (error) {
			console.error("Error assigning role:", error)
			res.status(500).json({ message: "Failed to assign role" })
		}
	}

	// get profiles other the current user
	static async getAllProfiles(req: Request, res: Response) {
		try {
			const userId = req.authUser?.id
			if (!userId) {
				return res.status(401).json({ message: "Not authenticated" })
			}

			const { data: profiles, error } = await supabase.from("profiles").select("*").neq("id", userId)

			if (error) {
				return res.status(500).json({ message: error.message })
			}

			res.status(200).json({ profiles })
		} catch (error) {
			console.error("Error fetching profiles:", error)
			res.status(500).json({ message: "Failed to fetch profiles" })
		}
	}
}
