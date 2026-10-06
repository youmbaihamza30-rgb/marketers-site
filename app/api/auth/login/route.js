import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req) {
  try {
    const { password } = await req.json();

    let role = null;
    if (password === '0101') role = 'admin';
    if (password === '0011') role = 'marketer';

    if (!role) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // إنشاء توكن الجلسة المعتمد في التطبيق
    const token = await createSessionToken(role);
    const res = NextResponse.json({ ok: true, role });

    res.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: 'حدث خطأ في إنشاء الجلسة' }, { status: 500 });
  }
}
