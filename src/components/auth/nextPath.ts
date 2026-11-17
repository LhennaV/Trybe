// Where to go after logging in. src/proxy.ts sends logged-out people to
// /login?next=<the page they wanted>. Plain TS (no React) so a native app can
// reuse it.

export const AFTER_LOGIN = "/feed";

// Only paths inside Trybe. Checking the string by hand misses tricks like
// "/\t/evil.com" (browsers drop the tab, leaving "//evil.com"), so the path is
// parsed the way a browser would and must stay on our own origin. Anything else
// falls back to the feed.
const BASE = "https://trybe.invalid";

export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return AFTER_LOGIN;
  try {
    const url = new URL(next, BASE);
    if (url.origin !== BASE) return AFTER_LOGIN;
    return url.pathname + url.search + url.hash;
  } catch {
    return AFTER_LOGIN;
  }
}
