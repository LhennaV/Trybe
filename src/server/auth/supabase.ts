import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Supabase clients for server code. Create a new one per request; never share
// a client between requests.

function publicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. See .env.example.");
  }
  return { url, key };
}

const NO_SESSION = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };

// No session. For calls that don't sign anyone in: sign up, password reset
// email, resending the verification email, checking a bearer token.
export function createAnonClient() {
  const { url, key } = publicEnv();
  return createClient(url, key, { auth: NO_SESSION });
}

// Reads and writes the web session cookies. Only works inside a route
// handler or server function, where Next lets us set cookies.
export async function createCookieClient() {
  const { url, key } = publicEnv();
  const store = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) store.set(name, value, options);
      },
    },
  });
}

// Service role: bypasses RLS and can manage any account. Server only.
// Use it only when the user has already been checked with requireUser().
export function createAdminClient() {
  const { url } = publicEnv();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set. See .env.example.");
  return createClient(url, key, { auth: NO_SESSION });
}
