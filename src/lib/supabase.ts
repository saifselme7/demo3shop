import { createClient } from '@supabase/supabase-js';

const env = import.meta.env as ImportMetaEnv & {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
};

export const supabaseUrl = env.VITE_SUPABASE_URL ?? '';
export const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY ?? '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * This client is intentionally created with the publishable/anon key only.
 * The service role key belongs exclusively in Supabase Edge Functions.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
