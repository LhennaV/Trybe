import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, isAuthApiError, isAuthRetryableFetchError, type User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { AppError } from "@/server/errors";

// The signed-in person, as the server sees them. Supabase Auth is the source
// of truth for email and verification, not the users table.
export type SessionUser = { id: string; email: string; emailVerified: boolean };

function supabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set. See .env.example.");
  }
  return { url, key };
}

// `Authorization: Bearer <access token>`, sent by native clients (TRD section 10).
export function bearerToken(request: Request): string | null {
  const match = request.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i);
  return match ? match[1] : null;
}

// A missing, expired, or invalid session means "logged out". A Supabase
// outage is a real error and must not look like a logout.
function userOrNull(result: { data: { user: User | null }; error: unknown }): User | null {
  const { error } = result;
  if (!error) return result.data.user;
  if (isAuthRetryableFetchError(error)) throw error;
  if (isAuthApiError(error) && error.status >= 500) throw error;
  return null;
}

async function userFromToken(token: string) {
  const { url, key } = supabaseEnv();
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return userOrNull(await client.auth.getUser(token));
}

// Web clients. A token refresh writes new cookies onto the route's response.
async function userFromCookies() {
  const { url, key } = supabaseEnv();
  const store = await cookies();
  const client = createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) store.set(name, value, options);
      },
    },
  });
  return userOrNull(await client.auth.getUser());
}

// getUser() asks Supabase Auth to confirm the token on every call, so a
// deleted or banned account is logged out right away.
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const token = bearerToken(request);
  const user = token ? await userFromToken(token) : await userFromCookies();
  if (!user?.email) return null;
  return { id: user.id, email: user.email, emailVerified: Boolean(user.email_confirmed_at) };
}

// For endpoints that need a signed-in user. Throws UNAUTHENTICATED (401).
export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await getSessionUser(request);
  if (!user) throw new AppError("UNAUTHENTICATED");
  return user;
}
