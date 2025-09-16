import { Request, Response, NextFunction } from "express"

export function authorize(requiredRoles: string | string[]) {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.authUser) {
			res.status(401).json({ message: "Unauthorized" })
			return
		}

		const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
		const hasRole = req.authUser.roles.some((role) => roles.includes(role))

		if (!hasRole) {
			res.status(403).json({ message: "Forbidden: insufficient role" })
			return
		}

		next()
	}
}
