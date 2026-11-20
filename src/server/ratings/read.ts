import "server-only";
import { and, desc, eq, isNotNull, sql, type SQL } from "drizzle-orm";
import type { Page, PageQuery } from "@/shared/contracts/common";
import type { RatingTag, Review } from "@/shared/contracts/trades";
import { getDb } from "@/server/db";
import { ratings, users } from "@/server/db/schema";
import { decodeCursor, encodeCursor } from "@/server/http/cursor";
import { toUserSummary } from "@/server/users/summary";

// GET /api/users/:handle/reviews?cursor=&limit= (PROF-03). The ratings a
// person received, newest shown first. Hidden ratings (RATE-02) never appear.
export async function listUserReviews(userId: string, query: PageQuery): Promise<Page<Review>> {
  const cursor = decodeCursor(query.cursor);
  const conditions: SQL[] = [eq(ratings.rateeId, userId), isNotNull(ratings.visibleAt)];
  if (cursor) {
    conditions.push(sql`(${ratings.visibleAt}, ${ratings.id}) < (${cursor.at}::timestamptz, ${cursor.id}::uuid)`);
  }

  // One extra row tells us whether there is a next page. A deleted author
  // leaves rater_id null, hence the left join.
  const rows = await getDb()
    .select({ rating: ratings, author: users, at: sql<string>`${ratings.visibleAt}::text` })
    .from(ratings)
    .leftJoin(users, eq(users.id, ratings.raterId))
    .where(and(...conditions))
    .orderBy(desc(ratings.visibleAt), desc(ratings.id))
    .limit(query.limit + 1);

  const page = rows.slice(0, query.limit);
  const last = page.at(-1);
  return {
    items: page.map(({ rating, author }) => ({
      id: rating.id,
      author: author ? toUserSummary(author) : null,
      score: rating.score,
      tags: rating.tags as RatingTag[],
      note: rating.note,
      createdAt: rating.visibleAt!.toISOString(),
    })),
    nextCursor: rows.length > query.limit && last ? encodeCursor({ at: last.at, id: last.rating.id }) : null,
  };
}
