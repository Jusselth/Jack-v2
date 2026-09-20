import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY;

export const supabase = createClient(env.SUPABASE_URL, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
export const isSupabaseConfigured =
  Boolean(env.SUPABASE_URL) &&
  !env.SUPABASE_URL.includes('placeholder') &&
  Boolean(supabaseKey) &&
  !supabaseKey.includes('placeholder');
