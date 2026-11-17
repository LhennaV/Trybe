// Where to go after logging in. src/proxy.ts sends logged-out people to
// /login?next=<the page they wanted>. Plain TS (no React) so a native app can
// reuse it.

export const AFTER_LOGIN = "/feed";

// Only paths inside Trybe. "//evil.com" and "/\evil.com" are other sites to a
// browser, so they fall back to the feed, as does anything not starting with "/".
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return AFTER_LOGIN;
  return next;
}
