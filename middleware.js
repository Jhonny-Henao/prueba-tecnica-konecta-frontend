import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Rutas públicas (no requieren autenticación)
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Si está en ruta pública y tiene token, redirigir al dashboard
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Si NO está en ruta pública y NO tiene token, redirigir al login
  if (!isPublicPath && !token && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};