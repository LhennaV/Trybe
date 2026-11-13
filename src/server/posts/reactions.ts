import "server-only";
import { and, count, eq } from "drizzle-orm";
import type { LikeResult, SaveResult } from "@/shared/contracts/posts";
import type { SessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { likes, saves } from "@/server/db/schema";
import { assertVisiblePost } from "@/server/posts/read";

// Likes and saves (POST-06, POST-07). Repeating a like or save changes
// nothing, so a double tap or a retry is harmless.

async function likeCount(postId: string) {
  const [row] = await getDb().select({ n: count() }).from(likes).where(eq(likes.postId, postId));
  return row.n;
}

export async function setLiked(user: SessionUser, postId: string, liked: boolean): Promise<LikeResult> {
  await assertVisiblePost(postId);
  const db = getDb();
  if (liked) await db.insert(likes).values({ userId: user.id, postId }).onConflictDoNothing();
  else await db.delete(likes).where(and(eq(likes.userId, user.id), eq(likes.postId, postId)));
  return { likedByMe: liked, likeCount: await likeCount(postId) };
}

export async function setSaved(user: SessionUser, postId: string, saved: boolean): Promise<SaveResult> {
  await assertVisiblePost(postId);
  const db = getDb();
  if (saved) await db.insert(saves).values({ userId: user.id, postId }).onConflictDoNothing();
  else await db.delete(saves).where(and(eq(saves.userId, user.id), eq(saves.postId, postId)));
  return { savedByMe: saved };
}
