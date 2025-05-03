import jwt from "jsonwebtoken"

const generateToken = (userId: string): string => {
	const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
		expiresIn: "1h"
	})
	return token
}

export default generateToken
