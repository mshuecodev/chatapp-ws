export type AuthUser = {
	id: string
	email: string
	name?: string
	image?: string
	createdAt: Date
	updatedAt: Date
	isEmailVerified?: boolean
	isActive?: boolean
	role?: "user" | "admin"
	accessToken?: string
	refreshToken?: string
	app_metadata?: Record<string, any>
	user_metadata?: Record<string, any>
}
