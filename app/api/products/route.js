import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin, STORAGE_BUCKET, publicImageUrl } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

function serializeProduct(p) {
  return { ...p, image_url: publicImageUrl(p.image_path) };
}

export async function GET(req) {
  const { error } = await requireRole();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  const categoryId = searchParams.get('category_id');

  const supabase = supabaseAdmin();
  let query = supabase.from('products').select('*').order('sort_order', { ascending: true });

  if (categoryId) query = query.eq('category_id', categoryId);
  if (q) query = query.ilike('name', `%${q}%`);

  const { data, error: dbError } = await query;
  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  return NextResponse.json({ products: data.map(serializeProduct) });
}

export async function POST(req) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const form = await req.formData();
  const name = form.get('name')?.toString().trim();
  const price = parseFloat(form.get('price') || '0');
  const categoryId = form.get('category_id')?.toString() || null;
  const file = form.get('image');

  if (!name) return NextResponse.json({ error: 'اسم المنتج مطلوب' }, { status: 400 });

  const supabase = supabaseAdmin();
  let imagePath = null;

  if (file && typeof file === 'object' && file.size > 0) {
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
    imagePath = `products/${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(imagePath, bytes, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });
    if (upErr) return NextResponse.json({ error: 'فشل رفع الصورة: ' + upErr.message }, { status: 500 });
  }

  const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });

  const { data, error: dbError } = await supabase
    .from('products')
    .insert({ name, price, category_id: categoryId, image_path: imagePath, sort_order: count || 0 })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ product: { ...data, image_url: publicImageUrl(data.image_path) } });
}
