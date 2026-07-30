import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { requireRole } from '@/lib/requireRole';
import { hashPassword } from '@/lib/auth';

// body: { target: 'admin' | 'marketer', newPassword }
export async function POST(req) {
  const { error } = await requireRole('admin');
  if (error) return error;

  const { target, newPassword } = await req.json();
  if (!['admin', 'marketer'].includes(target)) {
    return NextResponse.json({ error: 'هدف غير صحيح' }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 4) {
    return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' }, { status: 400 });
  }

  const hash = await hashPassword(newPassword);
  const column = target === 'admin' ? 'admin_password_hash' : 'marketer_password_hash';

  const supabase = supabaseAdmin();
  const { error: dbError } = await supabase
    .from('app_settings')
    .update({ [column]: hash, updated_at: new Date().toISOString() })
    .eq('id', 1);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
