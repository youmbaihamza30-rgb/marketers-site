import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

const ALLOWED_TABLES = {
  baladiyat: 'delivery_baladiyat',
  'wilayat-home': 'delivery_wilayat_home',
  'wilayat-office': 'delivery_wilayat_office',
};

function resolveTable(key) {
  return ALLOWED_TABLES[key] || null;
}

export async function GET(req, { params }) {
  const { error } = await requireRole();
  if (error) return error;

  const table = resolveTable(params.table);
  if (!table) return NextResponse.json({ error: 'جدول غير معروف' }, { status: 404 });

  const supabase = supabaseAdmin();
  const { data, error: dbError } = await supabase.from(table).select('*').order('sort_order', { ascending: true });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ rows: data });
}

export async function POST(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const table = resolveTable(params.table);
  if (!table) return NextResponse.json({ error: 'جدول غير معروف' }, { status: 404 });

  const { name, price } = await req.json();
  if (!name || !name.trim()) return NextResponse.json({ error: 'الاسم مطلوب' }, { status: 400 });

  const supabase = supabaseAdmin();
  const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });

  const { data, error: dbError } = await supabase
    .from(table)
    .insert({ name: name.trim(), price: parseFloat(price) || 0, sort_order: count || 0 })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ row: data });
}

export async function PATCH(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const table = resolveTable(params.table);
  if (!table) return NextResponse.json({ error: 'جدول غير معروف' }, { status: 404 });

  const { id, name, price } = await req.json();
  if (!id) return NextResponse.json({ error: 'المعرّف مطلوب' }, { status: 400 });

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (price !== undefined) updates.price = parseFloat(price) || 0;

  const supabase = supabaseAdmin();
  const { data, error: dbError } = await supabase.from(table).update(updates).eq('id', id).select().single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ row: data });
}

export async function DELETE(req, { params }) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const table = resolveTable(params.table);
  if (!table) return NextResponse.json({ error: 'جدول غير معروف' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'المعرّف مطلوب' }, { status: 400 });

  const supabase = supabaseAdmin();
  const { error: dbError } = await supabase.from(table).delete().eq('id', id);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
