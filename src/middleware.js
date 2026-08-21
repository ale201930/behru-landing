import { NextResponse } from 'next/server';

const TOKEN_NAME = 'admin_session_token';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Proteger rutas de administración que requieren sesión (/admin/dashboard*)
  if (pathname.startsWith('/admin/dashboard')) {
    const token = req.cookies.get(TOKEN_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Proteger APIs de subida de archivos (/api/upload*, /api/blob*)
  if (pathname.startsWith('/api/upload') || pathname.startsWith('/api/blob')) {
    const token = req.cookies.get(TOKEN_NAME)?.value;

    if (!token) {
      return NextResponse.json({ message: 'No autorizado. Debe iniciar sesión.' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*', '/api/upload/:path*', '/api/blob/:path*'],
};
