import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8000').transform((val) => parseInt(val, 10)),
  SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),
  LOCAL_LLM_BASE_URL: z.string().default('http://localhost:1234/v1'),
  LOCAL_LLM_MODEL: z.string().default('llama-3.2-3b-instruct'),
  WEBHOOK_SECRET: z.string().optional().default('my_secure_local_secret'),
});

export const env = envSchema.parse(process.env);
