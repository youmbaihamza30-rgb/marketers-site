import { NextResponse } from 'next/server';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

export async function PATCH(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const body = await req.json();
  const updates = {};
  if ('name' in body) updates.name = body.name;
  if ('price' in body) updates.price = body.price === '' || body.price === null ? null : parseFloat(body.price);
  if ('category_id' in body) updates.category_id = body.category_id;

  const supabase = supabaseAdmin();
  const { data, error: dbError } = await supabase
    .from('product_images')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ image: data });
}

export async function DELETE(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const supabase = supabaseAdmin();
  const { data: img } = await supabase.from('product_images').select('storage_path').eq('id', params.id).single();

  if (img?.storage_path) {
    await supabase.storage.from(STORAGE_BUCKET).remove([img.storage_path]);
  }
  const { error: dbError } = await supabase.from('product_images').delete().eq('id', params.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
