import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.warn("CẢNH BÁO: Thiếu SUPABASE_SERVICE_ROLE_KEY trong .env.local. Quyền Admin sẽ không hoạt động.");
}

// Client này có quyền tối cao (bypass RLS) - Chỉ được dùng ở Server-side
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
