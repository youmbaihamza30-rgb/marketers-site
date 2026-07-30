import { NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  const isAdminArea = pathname.startsWith('/admin');
  const isSiteArea =
    pathname.startsWith('/products') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/delivery');

  if (!isAdminArea && !isSiteArea) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminArea && session.role !== 'admin') {
    const homeUrl = new URL('/products', req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/products/:path*', '/images/:path*', '/delivery/:path*'],
};
