import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

export async function PATCH(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const { name } = await req.json();
  const supabase = supabaseAdmin();
  const { data, error: dbError } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', params.id)
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ category: data });
}

export async function DELETE(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const supabase = supabaseAdmin();
  const { error: dbError } = await supabase.from('categories').delete().eq('id', params.id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
