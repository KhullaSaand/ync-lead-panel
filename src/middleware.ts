import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register';
  const isApiAuth = req.nextUrl.pathname.startsWith('/api/auth');

  // Allow auth API routes
  if (isApiAuth) {
    return NextResponse.next();
  }

  // Allow register API without auth (for initial setup)
  if (req.nextUrl.pathname === '/api/auth/register') {
    return NextResponse.next();
  }

  // Allow leads API for POST (external form submissions)
  if (req.nextUrl.pathname === '/api/leads' && req.method === 'POST') {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and not on auth pages
  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Redirect to dashboard if logged in and on auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
