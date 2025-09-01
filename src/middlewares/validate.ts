// /src/middlewares/validate.ts
import { Request, Response, NextFunction } from "express"
import { ZodType, ZodError } from "zod"

export const validate = (schema: ZodType<any, any>) => (req: Request, res: Response, next: NextFunction) => {
	try {
		schema.parse(req.body) // validate body
		next()
	} catch (error) {
		//   if (error instanceof ZodError) {
		//     return res.status(400).json({
		//       errors: error.errors.map((err) => ({
		//         path: err.path.join("."),
		//         message: err.message,
		//       })),
		//     });
		//   }
		next(error)
	}
}
