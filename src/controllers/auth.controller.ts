import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import User from "../models/User"
import generateToken from "../utils/jwtUtils"

export const register = async (req: Request, res: Response) => {
	const { username, email, password } = req.body

	try {
		const hashedPassword = await bcrypt.hash(password, 10)
		const user = await User.create({
			username,
			email,
			password: hashedPassword
		})

		const token = generateToken(user._id as string)

		if (token) {
			res.status(201).json({ token: generateToken(user._id as string) })
		} else {
			res.status(500).json({ message: "Token generation failed" })
		}
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
}

export const login = async (req: Request, res: Response) => {
	const { email, password } = req.body

	try {
		const user = await User.findOne({ email })

		if (!user) {
			res.status(401).json({ message: "Invalid credentials" })
			return
		}
		const isMatch = await bcrypt.compare(password, user.password)

		if (!isMatch) {
			res.status(401).json({ message: "Invalid credentials" })
		}
		res.status(200).json({ token: generateToken(user._id as string) })
	} catch (error) {
		console.error(error)
		res.status(500).json({ message: "Server error" })
	}
}
