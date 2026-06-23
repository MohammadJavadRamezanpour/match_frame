import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/upload', '/payment', '/submitted', '/report', '/account'];
const PUBLIC_EXCEPTIONS = ['/report/sample'];
const AUTH_PAGES = ['/signin', '/signup'];

// Lightweight Edge-safe auth gate.
//
// We don't import `@supabase/ssr` here because it pulls in `@supabase/supabase-js`,
// which uses Node-only globals (`__dirname`, `process.version`) that the Edge runtime
// doesn't expose. Instead we look for the presence of the Supabase auth cookie —
// the source of truth (token validity, refresh, RLS) is enforced by `requireUser()`
// in server components and per-route auth checks in API handlers.
function hasAuthCookie(request: NextRequest) {
  // Supabase stores the auth token as either `sb-<ref>-auth-token` (single)
  // or chunked across `sb-<ref>-auth-token.0`, `sb-<ref>-auth-token.1`, ...
  // After OAuth the session is large and almost always chunked.
  const AUTH_TOKEN_RE = /^sb-.+-auth-token(\.\d+)?$/;
  for (const cookie of request.cookies.getAll()) {
    if (AUTH_TOKEN_RE.test(cookie.name) && cookie.value) {
      return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const authed = hasAuthCookie(request);

  const isProtected =
    PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`)) &&
    !PUBLIC_EXCEPTIONS.includes(path);

  if (!authed && isProtected) {
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
