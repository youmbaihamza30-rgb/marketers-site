import { NextResponse } from 'next/server';
import { checkPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req) {
  const { password } = await req.json();

  if (!password || typeof password !== 'string') {
    return NextResponse.json({ error: 'الرجاء إدخال كلمة المرور' }, { status: 400 });
  }

  const role = await checkPassword(password);
  if (!role) {
    return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
  }

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
}
