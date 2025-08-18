import "dotenv/config"

const required = (key: string, fallback?: string) => {
	const v = process.env[key] ?? fallback
	if (v === undefined || v === "") throw new Error(`Missing env: ${key}`)
	return v
}

export const ENV = {
	NODE_ENV: process.env.NODE_ENV ?? "development",
	PORT: Number(process.env.PORT ?? 4000),
	SUPABASE_URL: required("SUPABASE_URL"),
	SUPABASE_ANON_KEY: required("SUPABASE_ANON_KEY"),
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY, // optional
	COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "localhost",
	COOKIE_SECURE: (process.env.COOKIE_SECURE ?? "false") === "true",
	COOKIE_SAME_SITE: (process.env.COOKIE_SAME_SITE as "lax" | "strict" | "none") ?? "lax"
}
