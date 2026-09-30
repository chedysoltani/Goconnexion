import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('gc_access')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedStages =
    pathname.startsWith('/stages/nouvelle') ||
    pathname.startsWith('/stages/mes-offres') ||
    pathname.startsWith('/stages/mes-candidatures');
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || isProtectedStages;
  const isAuthPage =
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/signup') ||
    pathname.startsWith('/auth/select-role');

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/admin/:path*', '/admin', '/auth/login', '/auth/signup', '/auth/select-role',
    '/stages/nouvelle', '/stages/mes-offres', '/stages/mes-candidatures',
  ],
};
