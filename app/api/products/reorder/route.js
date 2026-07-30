import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';

// body: { order: [{id, sort_order}, ...] }
export async function POST(req) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const { order } = await req.json();
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: 'صيغة غير صحيحة' }, { status: 400 });
  }

  const supabase = supabaseAdmin();
  const updates = order.map(({ id, sort_order }) =>
    supabase.from('products').update({ sort_order }).eq('id', id)
  );
  await Promise.all(updates);

  return NextResponse.json({ ok: true });
}
