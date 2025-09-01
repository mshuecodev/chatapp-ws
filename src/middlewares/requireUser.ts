import { Request, Response, NextFunction } from "express"
import { getUserFromAccessToken } from "../services/auth.service"

// export interface RequestWithUser extends Request {
// 	user?: any
// }

export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
	const raw = (req.headers.authorization || "") as string
	if (!raw) return res.status(401).json({ error: "Missing Authorization header" })

	const user = await getUserFromAccessToken(raw)
	if (!user) return res.status(401).json({ error: "Invalid or expired token" })

	req.user = user
	return next()
}
