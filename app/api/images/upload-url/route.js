import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

// يولّد روابط رفع موقّعة (signed upload URLs) بحيث يرفع المتصفح الصور مباشرة
// إلى تخزين Supabase دون المرور عبر سيرفر Next.js — يسمح برفع عشرات/مئات
// الصور دفعة واحدة دون أي حد لحجم الطلب أو مهلة التنفيذ.
// body: { category_id, files: [{ filename }, ...] }
export async function POST(req) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const { category_id, files } = await req.json();
  if (!category_id || !Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: 'بيانات ناقصة' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const results = [];

  for (const f of files) {
    const ext = (f.filename?.split('.').pop() || 'jpg').toLowerCase();
    const path = `categories/${category_id}/${randomUUID()}.${ext}`;
    const { data, error: signErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(path);

    if (signErr) {
      results.push({ filename: f.filename, error: signErr.message });
      continue;
    }
    results.push({
      filename: f.filename,
      path,
      token: data.token,
      signedUrl: data.signedUrl,
    });
  }

  return NextResponse.json({ uploads: results });
}
