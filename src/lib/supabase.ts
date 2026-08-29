import { createClient } from '@supabase/supabase-js';

const env = import.meta.env as ImportMetaEnv & {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

export const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const supabasePublishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

/**
 * This client intentionally uses the Supabase publishable key only.
 * All privileged behavior is enforced by RLS and security-definer RPCs.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
