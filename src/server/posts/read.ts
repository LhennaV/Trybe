import "server-only";
import { and, asc, desc, eq, inArray, isNull, sql, type SQL } from "drizzle-orm";
import type { Page } from "@/shared/contracts/common";
import type { FeedQuery, PostCard, PostDetail } from "@/shared/contracts/posts";
import type { UserSummary } from "@/shared/contracts/users";
import { getDb } from "@/server/db";
import { hobbies, items, likes, photos, postItems, postPhotos, posts, saves, users } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import { decodeCursor, encodeCursor } from "@/server/http/cursor";
import { loadItems } from "@/server/items/read";
import { toPhoto } from "@/server/photos/photos";
import { isNewTrader } from "@/server/users/newTrader";

// Reading posts: feed cards and post details (TRD section 8.4).

// Posts anyone may see: not hidden by moderation, author not suspended.
const visible = and(isNull(posts.hiddenAt), isNull(users.suspendedAt));

function toSummary(user: typeof users.$inferSelect): UserSummary {
  // Ratings and trade counts arrive with Phases 3 and 4.
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

// Feed cards for these post ids, in the same order. `viewerId` fills
// likedByMe and savedByMe; null when logged out.
export async function loadPostCards(ids: string[], viewerId: string | null): Promise<PostCard[]> {
  if (ids.length === 0) return [];
  const viewer = viewerId ?? "00000000-0000-0000-0000-000000000000";

  const rows = await getDb()
    .select({
      post: posts,
      author: users,
      hobby: { id: hobbies.id, name: hobbies.name, slug: hobbies.slug },
      cover: photos,
      // POST-02: for trade when any tagged item is up for trade and available.
      upForTrade: sql<boolean>`exists (
        select 1 from ${postItems} join ${items} on ${items.id} = ${postItems.itemId}
        where ${postItems.postId} = ${posts.id} and ${items.upForTrade} and ${items.status} = 'available')`,
      likeCount: sql<number>`(select count(*)::int from ${likes} where ${likes.postId} = ${posts.id})`,
      likedByMe: sql<boolean>`exists (select 1 from ${likes} where ${likes.postId} = ${posts.id} and ${likes.userId} = ${viewer})`,
      savedByMe: sql<boolean>`exists (select 1 from ${saves} where ${saves.postId} = ${posts.id} and ${saves.userId} = ${viewer})`,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .innerJoin(hobbies, eq(hobbies.id, posts.hobbyId))
    .innerJoin(postPhotos, and(eq(postPhotos.postId, posts.id), eq(postPhotos.position, 0)))
    .innerJoin(photos, eq(photos.id, postPhotos.photoId))
    .where(inArray(posts.id, ids));

  const byId = new Map(
    rows.map((r) => [
      r.post.id,
      {
        id: r.post.id,
        title: r.post.title,
        author: toSummary(r.author),
        hobby: r.hobby,
        cover: toPhoto(r.cover),
        upForTrade: r.upForTrade,
        likeCount: r.likeCount,
        likedByMe: viewerId ? r.likedByMe : false,
        savedByMe: viewerId ? r.savedByMe : false,
        createdAt: r.post.createdAt.toISOString(),
      } satisfies PostCard,
    ]),
  );
  return ids.flatMap((id) => byId.get(id) ?? []);
}

// GET /api/posts/:id. Hidden posts and posts by suspended people are 404.
export async function getPostDetail(postId: string, viewerId: string | null): Promise<PostDetail> {
  const db = getDb();
  const [row] = await db
    .select({ post: posts })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .where(and(eq(posts.id, postId), visible))
    .limit(1);
  if (!row) throw new AppError("NOT_FOUND", "We couldn't find that post.");

  const [[card], photoRows, tagged] = await Promise.all([
    loadPostCards([postId], viewerId),
    db
      .select({ photo: photos })
      .from(postPhotos)
      .innerJoin(photos, eq(photos.id, postPhotos.photoId))
      .where(eq(postPhotos.postId, postId))
      .orderBy(asc(postPhotos.position)),
    db.select({ itemId: postItems.itemId }).from(postItems).where(eq(postItems.postId, postId)).orderBy(asc(postItems.createdAt)),
  ]);

  return {
    ...card,
    caption: row.post.caption,
    photos: photoRows.map((p) => toPhoto(p.photo)),
    items: await loadItems(tagged.map((t) => t.itemId)),
    updatedAt: row.post.updatedAt.toISOString(),
  };
}

// GET /api/feed?hobby=&cursor=&limit= (POST-05). Newest first. The cursor is
// the last post's exact (created_at, id), so new posts arriving at the top
// never shift later pages: no repeats, no gaps.
export async function listFeed(query: FeedQuery, viewerId: string | null): Promise<Page<PostCard>> {
  const db = getDb();
  const cursor = decodeCursor(query.cursor);
  const conditions: SQL[] = [visible!];

  if (query.hobby) {
    const [hobby] = await db.select({ id: hobbies.id }).from(hobbies).where(eq(hobbies.slug, query.hobby)).limit(1);
    if (!hobby) return { items: [], nextCursor: null };
    conditions.push(eq(posts.hobbyId, hobby.id));
  }
  if (cursor) conditions.push(sql`(${posts.createdAt}, ${posts.id}) < (${cursor.at}::timestamptz, ${cursor.id}::uuid)`);

  const rows = await db
    .select({ id: posts.id, at: sql<string>`${posts.createdAt}::text` })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .where(and(...conditions))
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(query.limit + 1);

  const page = rows.slice(0, query.limit);
  const last = page.at(-1);
  return {
    items: await loadPostCards(
      page.map((r) => r.id),
      viewerId,
    ),
    nextCursor: rows.length > query.limit && last ? encodeCursor({ at: last.at, id: last.id }) : null,
  };
}

// For likes and saves: the post must exist and be visible.
export async function assertVisiblePost(postId: string) {
  const [row] = await getDb()
    .select({ id: posts.id })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.userId))
    .where(and(eq(posts.id, postId), visible))
    .limit(1);
  if (!row) throw new AppError("NOT_FOUND", "We couldn't find that post.");
}
