import { RequestHandler, Request, Response } from "express"
// import bcrypt from "bcryptjs"
// import User from "../models/User"
// import generateToken from "../utils/jwtUtils"
import { supabaseAdmin, supabase } from "../config/supabase"

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000"

// MONGO FUNCTION
// export const register = async (req: Request, res: Response) => {
// 	const { username, email, password } = req.body

// 	try {
// 		const hashedPassword = await bcrypt.hash(password, 10)
// 		const user = await User.create({
// 			username,
// 			email,
// 			password: hashedPassword
// 		})

// 		const token = generateToken(user._id as string)

// 		if (token) {
// 			res.status(201).json({ token: generateToken(user._id as string) })
// 		} else {
// 			res.status(500).json({ message: "Token generation failed" })
// 		}
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({ message: "Server error" })
// 	}
// }

// export const login = async (req: Request, res: Response) => {
// 	const { email, password } = req.body

// 	try {
// 		const user = await User.findOne({ email })

// 		if (!user) {
// 			res.status(401).json({ message: "Invalid credentials" })
// 			return
// 		}
// 		const isMatch = await bcrypt.compare(password, user.password)

// 		if (!isMatch) {
// 			res.status(401).json({ message: "Invalid credentials" })
// 		}
// 		res.status(200).json({ token: generateToken(user._id as string) })
// 	} catch (error) {
// 		console.error(error)
// 		res.status(500).json({ message: "Server error" })
// 	}
// }

export class AuthController {
	/**
	 * Signup flow:
	 * 1. Create user with Supabase Auth
	 * 2. Insert profile record
	 * 3. Assign default role(s)
	 */

	static async signup(req: Request, res: Response) {
		try {
			const { email, password } = req.body

			if (!email || !password) {
				return res.status(400).json({ message: "Email and password are required" })
			}

			// 1. Create user via Supabase Auth
			const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${CLIENT_URL}/auth/callback` // URL where user will be redirected after verifying
				}
			})

			if (signUpError || !signUpData.user) {
				return res.status(400).json({ message: signUpError?.message || "Signup failed" })
			}

			const userId = signUpData.user.id

			// 2. Create profile record
			const { error: profileError } = await supabaseAdmin.from("profiles2").insert({
				user_id: userId,
				email
			})

			if (profileError) {
				// rollback user if profile fails
				await supabaseAdmin.auth.admin.deleteUser(userId)
				return res.status(500).json({ message: "Failed to create profile, user rolled back." })
			}

			// 3. Assign default role (e.g., "user")
			const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
				user_id: userId,
				role: "user"
			})

			if (roleError) {
				// rollback profile + user

				await supabaseAdmin.from("profiles2").delete().eq("id", userId)
				await supabaseAdmin.auth.admin.deleteUser(userId)

				return res.status(500).json({ message: "Failed to assign role" })
			}

			res.status(201).json({
				message: "Signup successful",
				userId,
				email
			})
		} catch (error) {
			console.error("Signup error:", error)
			res.status(500).json({ message: "Internal server error" })
		}
	}

	/**
	 * Signin flow:
	 * 1. Authenticate user via Supabase
	 * 2. Return access token + refresh token
	 */

	static async signin(req: Request, res: Response) {
		try {
			const { email, password } = req.body

			if (!email || !password) {
				return res.status(400).json({ message: "Email and password are required" })
			}

			// Authenticate user
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password
			})

			if (error || !data.session) {
				return res.status(401).json({ message: "Invalid credentials" })
			}

			const { access_token, refresh_token, user } = data.session

			if (!user) {
				return res.status(401).json({ message: "Invalid login credentials" })
			}

			if (!user.email_confirmed_at) {
				return res.status(403).json({ message: "Please verify your email before signing in." })
			}

			res.status(200).json({
				message: "Signin successful",
				accessToken: access_token,
				refreshToken: refresh_token,
				user: {
					id: user.id,
					email: user.email
				}
			})
		} catch (error) {
			console.error("Signin error:", error)
			res.status(500).json({ message: "Internal server error" })
		}
	}

	static async resendVerificationEmail(req: Request, res: Response) {
		try {
			const { email } = req.body
			if (!email) {
				return res.status(400).json({ message: "Email is required" })
			}

			const { data, error } = await supabase.auth.resend({
				type: "signup",
				email,
				options: {
					emailRedirectTo: `${CLIENT_URL}/auth/callback`
				}
			})

			if (error) {
				return res.status(400).json({ message: error.message })
			}

			res.status(200).json({
				message: "Verification email resent successfully. Please check your inbox."
			})
		} catch (error) {
			console.error("Resend verification error:", error)
			res.status(500).json({ message: "Failed to resend verification email" })
		}
	}
}
