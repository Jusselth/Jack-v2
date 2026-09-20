import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  SUPABASE_URL: z.string().url().default('https://placeholder.supabase.co'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),
  LLM_BASE_URL: z.string().default('http://localhost:1234/v1'),
  LOCAL_LLM_BASE_URL: z.string().default('http://localhost:1234/v1'),
  LOCAL_LLM_MODEL: z.string().default('llama-3.2-3b-instruct'),
  WEBHOOK_SECRET: z.string().optional().default('my_secure_local_secret'),
});

const rawEnv = {
  ...process.env,
  LLM_BASE_URL: process.env.LLM_BASE_URL || process.env.LOCAL_LLM_BASE_URL || 'http://localhost:1234/v1',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
};

export const env = envSchema.parse(rawEnv);

