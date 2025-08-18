import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { ENV } from "../utils/env"

// Standard client for user-level auth flows (sign in/up, refresh, getUser)
export const supabase: SupabaseClient = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } })

// Optional: privileged client (only if you need Admin APIs). Keep usage minimal.
export const supabaseAdmin: SupabaseClient | null = ENV.SUPABASE_SERVICE_ROLE_KEY ? createClient(ENV.SUPABASE_URL, ENV.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } }) : null
