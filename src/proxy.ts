import { NextResponse, type NextRequest } from "next/server";

// Sends logged-out people from signed-in-only pages to the login screen, with
// ?next= so they come back after logging in.
//
// This is a quick check that a Supabase session cookie exists, nothing more
// (Next.js runs Proxy on every matched request, prefetches included, so it
// must stay fast). It doesn't prove the session is valid: the API checks that
// on every request and answers 401, and screens handle that by showing the
// signed-out state. Never rely on this file alone to protect data.

// @supabase/ssr names the cookie sb-<project-ref>-auth-token and splits long
// sessions into .0, .1, ... chunks.
const SESSION_COOKIE = /^sb-.+-auth-token(\.\d+)?$/;

export function proxy(request: NextRequest) {
  const signedIn = request.cookies.getAll().some(({ name, value }) => value && SESSION_COOKIE.test(name));
  if (signedIn) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const login = new URL("/login", request.url);
  login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

// Signed-in-only pages. Public ones (landing, feed, explore, search, posts,
// profiles at /users/..., legal, safety, the public /delete-account page)
// are left out on purpose. Keep in step with DISALLOW in src/app/robots.ts.
export const config = {
  matcher: [
    "/settings/:path*",
    "/profile/:path*",
    "/trades/:path*",
    "/notifications/:path*",
    "/new/:path*",
    "/saved/:path*",
    "/report/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
    "/posts/:id/propose",
  ],
};
