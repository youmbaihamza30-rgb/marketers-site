import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { supabaseAdmin, STORAGE_BUCKET, publicImageUrl } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

export async function PATCH(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const form = await req.formData();
  const supabase = supabaseAdmin();

  const updates = {};
  if (form.has('name')) updates.name = form.get('name').toString().trim();
  if (form.has('price')) updates.price = parseFloat(form.get('price'));
  if (form.has('category_id')) updates.category_id = form.get('category_id') || null;

  const file = form.get('image');
  if (file && typeof file === 'object' && file.size > 0) {
    const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase();
    const imagePath = `products/${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(imagePath, bytes, {
      contentType: file.type || 'image/jpeg',
      upsert: false,
    });
    if (upErr) return NextResponse.json({ error: 'فشل رفع الصورة: ' + upErr.message }, { status: 500 });
    updates.image_path = imagePath;
  }

  updates.updated_at = new Date().toISOString();

  const { data, error: dbError } = await supabase
    .from('products')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ product: { ...data, image_url: publicImageUrl(data.image_path) } });
}

export async function DELETE(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const supabase = supabaseAdmin();
  const { error: dbError } = await supabase.from('products').delete().eq('id', params.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
