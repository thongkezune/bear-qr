import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SERVICE_ROLE_KEY || '';

// Sử dụng biến global để duy trì singleton trong môi trường Next.js Dev
const globalForSupabase = global as unknown as {
  supabase: ReturnType<typeof createClient>;
  supabaseAdmin: ReturnType<typeof createClient>;
};

// Client dành cho phía Client (Browser)
export const supabase = globalForSupabase.supabase || createClient(supabaseUrl, supabaseAnonKey);

// Client dành cho phía Server (Admin)
export const supabaseAdmin = globalForSupabase.supabaseAdmin || ((supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null as any);

if (process.env.NODE_ENV !== 'production') {
  globalForSupabase.supabase = supabase;
  globalForSupabase.supabaseAdmin = supabaseAdmin;
}
