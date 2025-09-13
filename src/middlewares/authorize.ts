import { Request, Response, NextFunction } from "express"

export function authorize(requiredRole: string) {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.authUser) {
			res.status(401).json({ message: "Unauthorized" })
			return
		}

		if (!req.authUser.roles.includes(requiredRole)) {
			res.status(403).json({ message: "Forbidden: insufficient role" })
			return
		}

		next()
	}
}
