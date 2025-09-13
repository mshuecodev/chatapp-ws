import dotenv from "dotenv"
dotenv.config()

export const ENV = {
	SUPABASE_URL: process.env.SUPABASE_URL || "",
	SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "",
	SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
	PORT: process.env.PORT || "3000",
	NODE_ENV: process.env.NODE_ENV || "development"
}

if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY || !ENV.SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error("Missing required environment variables")
}
