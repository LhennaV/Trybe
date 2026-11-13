import "server-only";
import { eq } from "drizzle-orm";
import { requireUser, type SessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { users } from "@/server/db/schema";
import { AppError } from "@/server/errors";

// For endpoints that create or change content (items, posts, photos, likes):
// - signed in (401 UNAUTHENTICATED)
// - email verified, since unverified people can browse but not post (AUTH-05)
// - a profile exists (404 PROFILE_NOT_FOUND)
// - not suspended (403 FORBIDDEN)
export async function requireActiveUser(request: Request): Promise<SessionUser> {
  const user = await requireUser(request);
  if (!user.emailVerified) throw new AppError("EMAIL_NOT_VERIFIED");

  const [row] = await getDb()
    .select({ suspendedAt: users.suspendedAt })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row) throw new AppError("PROFILE_NOT_FOUND");
  if (row.suspendedAt) throw new AppError("FORBIDDEN", "This account is suspended.");

  return user;
}
