export class HttpError extends Error {
	status: number
	details?: unknown
	constructor(status: number, message: string, details?: unknown) {
		super(message)
		this.status = status
		this.details = details
	}
}

export const BadRequest = (msg = "Bad Request", details?: unknown) => new HttpError(400, msg, details)
export const Unauthorized = (msg = "Unauthorized") => new HttpError(401, msg)
export const Forbidden = (msg = "Forbidden") => new HttpError(403, msg)
