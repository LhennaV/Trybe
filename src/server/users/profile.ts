import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { handleSchema, type Me, type PublicProfile, type UserHobby } from "@/shared/contracts/users";
import type { SessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { hobbies, hobbyRequests, userHobbies, users } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import { isNewTrader } from "@/server/users/newTrader";

type UserRow = typeof users.$inferSelect;
type TradeStats = { rating: number | null; reviewCount: number; completedTrades: number };

// Builds the public profile. Only copies public fields, so a new column on
// users never leaks by accident (PROF-07: no report counts, no email).
export function toPublicProfile(
  row: UserRow,
  hobbyList: UserHobby[],
  stats: TradeStats,
  now: Date = new Date(),
): PublicProfile {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.displayName,
    photoUrl: row.photoUrl,
    bio: row.bio,
    city: row.city,
    hobbies: hobbyList,
    memberSince: row.createdAt.toISOString(),
    isNewTrader: isNewTrader({ createdAt: row.createdAt, completedTrades: stats.completedTrades }, now),
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    tradeCount: stats.completedTrades,
  };
}

async function loadHobbies(userId: string): Promise<UserHobby[]> {
  return getDb()
    .select({ id: hobbies.id, name: hobbies.name, slug: hobbies.slug, level: userHobbies.level })
    .from(userHobbies)
    .innerJoin(hobbies, eq(hobbies.id, userHobbies.hobbyId))
    .where(eq(userHobbies.userId, userId))
    .orderBy(asc(hobbies.name));
}

// Ratings and trades arrive in Phases 3 and 4. Until then every user has none.
// Give it the user id once the ratings and trades tables exist.
async function loadTradeStats(): Promise<TradeStats> {
  return { rating: null, reviewCount: 0, completedTrades: 0 };
}

async function buildProfile(row: UserRow) {
  const [hobbyList, stats] = await Promise.all([loadHobbies(row.id), loadTradeStats()]);
  return toPublicProfile(row, hobbyList, stats);
}

// GET /api/users/:handle. Suspended accounts are hidden.
export async function getPublicProfile(rawHandle: string): Promise<PublicProfile> {
  const handle = handleSchema.safeParse(rawHandle);
  if (!handle.success) throw new AppError("NOT_FOUND", "We couldn't find that trader.");

  const [row] = await getDb()
    .select()
    .from(users)
    .where(and(eq(users.handle, handle.data), isNull(users.suspendedAt)))
    .limit(1);
  if (!row) throw new AppError("NOT_FOUND", "We couldn't find that trader.");

  return buildProfile(row);
}

// GET /api/me. Email and verification come from the session (Supabase Auth).
export async function getMe(user: SessionUser): Promise<Me> {
  const [row] = await getDb().select().from(users).where(eq(users.id, user.id)).limit(1);
  if (!row) throw new AppError("PROFILE_NOT_FOUND");

  const otherHobbies = await getDb()
    .select({ name: hobbyRequests.name, level: hobbyRequests.level })
    .from(hobbyRequests)
    .where(eq(hobbyRequests.userId, user.id))
    .orderBy(asc(hobbyRequests.name));

  return {
    ...(await buildProfile(row)),
    otherHobbies,
    email: user.email,
    emailVerified: user.emailVerified,
    messagePermission: row.messagePermission,
  };
}
