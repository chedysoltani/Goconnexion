import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_HOME, ROLE_MARKER_COOKIE, canAccessAdminPath, isAdminRole } from '@/lib/admin-access';

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

  // Administration : le JWT (cookie httpOnly du domaine de l'API) est invisible ici, on se fie au
  // marqueur gc_role pour rediriger tôt. Absent (session antérieure) → app/admin/layout.tsx vérifie
  // via /auth/me. Dans tous les cas le backend renvoie 403 hors périmètre.
  if (pathname.startsWith('/admin')) {
    const role = request.cookies.get(ROLE_MARKER_COOKIE)?.value;
    if (role && !isAdminRole(role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
    if (isAdminRole(role) && !canAccessAdminPath(role, pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_HOME[role];
      url.search = '';
      return NextResponse.redirect(url);
    }
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
