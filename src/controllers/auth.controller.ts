import { RequestHandler, Request, Response } from "express"
// import bcrypt from "bcryptjs"
// import User from "../models/User"
// import generateToken from "../utils/jwtUtils"
import { supabaseAdmin, supabase } from "../config/supabase"

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:8081"

export class AuthController {
	/**
	 * Signup flow:
	 * 1. Create user with Supabase Auth
	 * 2. Insert profile record
	 * 3. Assign default role(s)
	 */

	static async signup(req: Request, res: Response) {
		try {
			const { email, password, role } = req.body

			if (!email || !password) {
				return res.status(400).json({ message: "Email and password are required" })
			}

			// Check if user already exists
			const { data: existingUser, error: existingUserError } = await supabaseAdmin.from("profiles").select("id").eq("email", email).single()

			if (existingUser && !existingUserError) {
				return res.status(409).json({ message: "User with this email already exists or email not verified yet!" })
			}

			// 1. Create user via Supabase Auth
			const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${CLIENT_URL}/(auth)/callback` // URL where user will be redirected after verifying
				}
			})

			if (signUpError || !signUpData.user) {
				console.log("Signup error:", signUpError?.code, signUpError?.message)
				return res.status(400).json({ message: signUpError?.message || "Signup failed" })
			}

			const userId = signUpData.user.id

			// 2. Create profile record
			const { error: profileError } = await supabaseAdmin.from("profiles").insert({
				user_id: userId,
				email,
				role: role || "user"
			})

			if (profileError) {
				console.log("Profile creation error:", profileError)
				// rollback user if profile fails
				await supabaseAdmin.auth.admin.deleteUser(userId)
				return res.status(500).json({ message: "Failed to create profile, user rolled back." })
			}

			// 3. Assign default role (e.g., "user")
			const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
				user_id: userId,
				role: role || "user"
			})

			if (roleError) {
				// rollback profile + user

				await supabaseAdmin.from("profiles").delete().eq("id", userId)
				await supabaseAdmin.auth.admin.deleteUser(userId)

				return res.status(500).json({ message: "Failed to assign role" })
			}

			res.status(201).json({
				message: signUpData.user.email ? "Signup successful! Please check your email to verify your account." : "Signup successful!",
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
				console.log("Signin error:", error?.code, error?.message)
				return res.status(Number(error?.status)).json({ message: error?.message })
			}

			const { access_token, refresh_token, user } = data.session

			// refresh token to HTTP-only cookie
			res.cookie("refresh_token", refresh_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
			})

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

			const { error } = await supabase.auth.resend({
				type: "signup",
				email,
				options: {
					emailRedirectTo: `${CLIENT_URL}/(auth)/callback`
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

	/**
	 * Refresh session:
	 * 1. Get refresh token from HTTP-only cookie
	 * 2. Use Supabase to refresh session
	 * 3. Set new refresh token in cookie, send new access token to frontend
	 */
	static async refreshSession(req: Request, res: Response) {
		try {
			const refreshToken = req.cookies?.refreshToken
			if (!refreshToken) {
				return res.status(401).json({ message: "Refresh token missing" })
			}

			const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })

			if (error || !data.session) {
				return res.status(401).json({ message: "Invalid or expired refresh token" })
			}

			const { access_token, refresh_token, user } = data.session

			// Update refresh token in HTTP-only cookie
			res.cookie("refreshToken", refresh_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "strict",
				maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
			})

			// Send new access token to frontend
			res.status(200).json({
				message: "Session refreshed",
				accessToken: access_token,
				user: {
					id: user.id,
					email: user.email
				}
			})
		} catch (error) {
			console.error("Refresh session error:", error)
			res.status(500).json({ message: "Internal server error" })
		}
	}
}
