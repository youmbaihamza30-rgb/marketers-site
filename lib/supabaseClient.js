'use client';
import { createClient } from '@supabase/supabase-js';

// عميل Supabase محدود الصلاحيات (anon key) يُستخدم في المتصفح فقط
// لغرض وحيد: رفع الصور مباشرة إلى التخزين عبر روابط رفع موقّعة (signed upload URL)
// التي يولّدها السيرفر. لا صلاحية له على قاعدة البيانات لأن RLS مفعّل بدون أي policy.
let cached;
export function supabaseBrowser() {
  if (cached) return cached;
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return cached;
}
