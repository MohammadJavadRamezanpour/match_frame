import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabasePublicKey, supabaseUrl } from './env';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    supabaseUrl(),
    supabasePublicKey(),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // Middleware refreshes the session, so this is safe to ignore.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            /* ignore */
          }
        },
      },
    },
  );
}
