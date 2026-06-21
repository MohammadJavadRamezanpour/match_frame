import { createClient } from '@supabase/supabase-js';
import { supabaseSecretKey, supabaseUrl } from './env';

// Server-only client that bypasses RLS (used by webhooks and AI worker).
export function createAdminClient() {
  return createClient(supabaseUrl(), supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
