import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { password } = await req.json();

    let role = null;
    if (password === '0101') role = 'admin';
    if (password === '0011') role = 'marketer';

    if (!role) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // إرسال رد النجاح وتعيين كوكي الجلسة مباشرة
    const res = NextResponse.json({ ok: true, role });
    res.cookies.set('session', role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
