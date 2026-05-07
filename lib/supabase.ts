import { createClient } from '@supabase/supabase-js';
import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser / client-side client — uses @supabase/ssr so cookies are set properly
// and the server-side session client can read them
export function createBrowserClient() {
  return createSSRBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Service-role admin client (bypasses RLS) — server only
export function createAdminClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
