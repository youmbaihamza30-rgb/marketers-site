import { NextResponse } from 'next/server';
import { supabaseAdmin, publicImageUrl } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

function serialize(img) {
  return { ...img, image_url: publicImageUrl(img.storage_path) };
}

export async function GET(req) {
  const { error } = await requireRole();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id');

  const supabase = supabaseAdmin();
  let query = supabase.from('product_images').select('*').order('sort_order', { ascending: true });
  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error: dbError } = await query;
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ images: data.map(serialize) });
}

// يُستدعى بعد نجاح الرفع المباشر إلى التخزين، لإنشاء سجلات في قاعدة البيانات دفعة واحدة
// body: { items: [{ category_id, storage_path }, ...] }
export async function POST(req) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const { items } = await req.json();
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'لا توجد عناصر' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { count } = await supabase.from('product_images').select('*', { count: 'exact', head: true });

  const rows = items.map((item, i) => ({
    category_id: item.category_id,
    storage_path: item.storage_path,
    sort_order: (count || 0) + i,
  }));

  const { data, error: dbError } = await supabase.from('product_images').insert(rows).select();
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });

  return NextResponse.json({ images: data.map(serialize) });
}
