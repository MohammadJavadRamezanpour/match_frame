import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/upload', '/payment', '/submitted', '/report', '/account'];
const AUTH_PAGES = ['/signin', '/signup'];

// Lightweight Edge-safe auth gate.
//
// We don't import `@supabase/ssr` here because it pulls in `@supabase/supabase-js`,
// which uses Node-only globals (`__dirname`, `process.version`) that the Edge runtime
// doesn't expose. Instead we look for the presence of the Supabase auth cookie —
// the source of truth (token validity, refresh, RLS) is enforced by `requireUser()`
// in server components and per-route auth checks in API handlers.
function hasAuthCookie(request: NextRequest) {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token') && cookie.value) {
      return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const authed = hasAuthCookie(request);

  if (!authed && PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  if (authed && AUTH_PAGES.includes(path)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Match only the routes where the gate is meaningful — skip API routes (they
// auth themselves) and asset files.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/upload/:path*',
    '/payment/:path*',
    '/submitted/:path*',
    '/report/:path*',
    '/account/:path*',
    '/signin',
    '/signup',
  ],
};
