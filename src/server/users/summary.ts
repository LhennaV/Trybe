import "server-only";
import type { UserSummary } from "@/shared/contracts/users";
import type { users } from "@/server/db/schema";
import { isNewTrader } from "@/server/users/newTrader";

// The small public card of a person, used on posts and trades. Only copies
// public fields, so a new column on users never leaks by accident.
export function toUserSummary(user: typeof users.$inferSelect): UserSummary {
  // Ratings and trade counts arrive with Phase 4.
  return {
    id: user.id,
    handle: user.handle,
    displayName: user.displayName,
    photoUrl: user.photoUrl,
    city: user.city,
    isNewTrader: isNewTrader({ createdAt: user.createdAt, completedTrades: 0 }),
    rating: null,
    tradeCount: 0,
  };
}
