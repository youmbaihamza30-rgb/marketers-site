import { createClient } from '@supabase/supabase-js';

// عميل Supabase بصلاحيات كاملة (service role) - يُستخدم فقط داخل السيرفر
// (API routes / Server Components) ولا يجب أبداً تمريره أو تعريضه للمتصفح.
let cached;
export function supabaseAdmin() {
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
  return cached;
}

export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images';

export function publicImageUrl(path) {
  if (!path) return null;
  const { data } = supabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
