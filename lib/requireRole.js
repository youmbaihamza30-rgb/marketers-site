import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from './auth';

// يتحقق من الجلسة داخل API routes. requiredRole = 'admin' يفرض أن يكون المستخدم مديراً،
// أما undefined فيكفي أي جلسة صالحة (مدير أو مسوّقة) لعمليات القراءة.
export async function requireRole(requiredRole) {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return { error: NextResponse.json({ error: 'غير مصرح - الرجاء تسجيل الدخول' }, { status: 401 }) };
  }
  if (requiredRole && session.role !== requiredRole) {
    return { error: NextResponse.json({ error: 'ليست لديك صلاحية القيام بهذا الإجراء' }, { status: 403 }) };
  }
  return { session };
}
