import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  SUPABASE_ANON_KEY: z.string().optional(),
  CHAT_ATTACHMENTS_BUCKET: z.string().default('chat-attachments'),
  MAX_UPLOAD_BYTES: z.coerce.number().default(10 * 1024 * 1024),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid/missing env vars', parsed.error.format());
  process.exit(1);
}

export const config = {
  PORT: parsed.data.PORT,
  SUPABASE_URL: parsed.data.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: parsed.data.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_ANON_KEY: parsed.data.SUPABASE_ANON_KEY,
  CHAT_ATTACHMENTS_BUCKET: parsed.data.CHAT_ATTACHMENTS_BUCKET,
  MAX_UPLOAD_BYTES: parsed.data.MAX_UPLOAD_BYTES,
};
