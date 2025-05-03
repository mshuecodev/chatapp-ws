import jwt from "jsonwebtoken"
import { NextFunction, Request, Response } from "express"

interface AuthRequest extends Request {
	user?: string
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
	const token = req.headers["authorization"]?.split(" ")[1] // Assuming the token is
	if (!token) {
		res.status(401).json({ message: "No token provided" })
	}

	try {
		if (!process.env.JWT_SECRET) {
			throw new Error("JWT_SECRET is not defined in the environment variables")
		}
		const decoded = jwt.verify(token as string, process.env.JWT_SECRET)
		req.user = (decoded as unknown as { id: string }).id // Assuming the token contains a user ID
		next()
	} catch (err) {
		res.status(401).json({ message: "Invalid token" })
	}
}

export default authMiddleware
