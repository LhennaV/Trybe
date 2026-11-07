import "server-only";
import { isAuthApiError, isAuthRetryableFetchError, type User } from "@supabase/supabase-js";
import { createAnonClient, createCookieClient } from "@/server/auth/supabase";
import { AppError } from "@/server/errors";

// The signed-in person, as the server sees them. Supabase Auth is the source
// of truth for email and verification.
export type SessionUser = { id: string; email: string; emailVerified: boolean };

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

// getUser() asks Supabase Auth to confirm the token on every call, so a
// deleted or banned account is logged out right away. On the web, a token
// refresh writes new cookies onto the route's response.
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
  const token = bearerToken(request);
  const user = token
    ? userOrNull(await createAnonClient().auth.getUser(token))
    : userOrNull(await (await createCookieClient()).auth.getUser());
  if (!user?.email) return null;
  return { id: user.id, email: user.email, emailVerified: Boolean(user.email_confirmed_at) };
}

// For endpoints that need a signed-in user. Throws UNAUTHENTICATED (401).
export async function requireUser(request: Request): Promise<SessionUser> {
  const user = await getSessionUser(request);
  if (!user) throw new AppError("UNAUTHENTICATED");
  return user;
}
