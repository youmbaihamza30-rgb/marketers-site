import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

export async function GET() {
  const { error } = await requireRole();
  if (error) return error;

  const supabase = supabaseAdmin();
  const { data, error: dbError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ categories: data });
}

export async function POST(req) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const { name } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'اسم القسم مطلوب' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const { count } = await supabase.from('categories').select('*', { count: 'exact', head: true });

  const { data, error: dbError } = await supabase
    .from('categories')
    .insert({ name: name.trim(), sort_order: count || 0 })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 400 });
  return NextResponse.json({ category: data });
}
