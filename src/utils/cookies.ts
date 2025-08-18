import { serialize } from "cookie"
import { ENV } from "./env"

const base = {
	httpOnly: true,
	secure: ENV.COOKIE_SECURE,
	sameSite: ENV.COOKIE_SAME_SITE,
	domain: ENV.COOKIE_DOMAIN,
	path: "/"
} as const

export const setAuthCookies = (accessToken: string, refreshToken: string) => [
	serialize("sb-access-token", accessToken, { ...base, maxAge: 60 * 60 }), // 1h
	serialize("sb-refresh-token", refreshToken, { ...base, maxAge: 60 * 60 * 24 * 14 }) // 14d
]

export const clearAuthCookies = () => [serialize("sb-access-token", "", { ...base, maxAge: 0 }), serialize("sb-refresh-token", "", { ...base, maxAge: 0 })]
