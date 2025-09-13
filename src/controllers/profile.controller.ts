import { Request, Response } from "express"
import { supabaseAdmin } from "../config/supabase"

export class ProfileController {
	static async getMe(req: Request, res: Response) {
		try {
			const userId = req.authUser!.id
			if (!userId) {
				return res.status(401).json({ message: "Not authenticated" })
			}

			const { data: profileData, error: profileError } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).single()

			if (profileError) {
				return res.status(400).json({ message: profileError.message })
			}

			res.status(200).json({ profile: profileData })
		} catch (error) {
			console.error("Error fetching profile:", error)
			res.status(500).json({ message: "Failed to fetch profile" })
		}
	}
}
