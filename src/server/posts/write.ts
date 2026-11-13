import "server-only";
import { and, eq, inArray } from "drizzle-orm";
import type { CreatePost, PostDetail, UpdatePost } from "@/shared/contracts/posts";
import type { SessionUser } from "@/server/auth/session";
import { findPgError, PG_FOREIGN_KEY_VIOLATION } from "@/server/db/pgError";
import { items, postItems, postPhotos, posts } from "@/server/db/schema";
import { withActor, type Tx } from "@/server/db/withActor";
import { AppError } from "@/server/errors";
import { claimPhotos, removePhotoRows } from "@/server/photos/photos";
import { getPostDetail } from "@/server/posts/read";
import { deletePhotos } from "@/server/uploads/storage";

// Creating and changing posts (POST-01, POST-09).

function toPostError(error: unknown): unknown {
  const pg = findPgError(error);
  if (pg?.code === PG_FOREIGN_KEY_VIOLATION && pg.constraint === "posts_hobby_id_hobbies_id_fk") {
    return new AppError("VALIDATION_FAILED", "Pick a hobby from the list.", { hobbyId: ["Pick a hobby from the list."] });
  }
  return error;
}

// Tagged gear must be the author's own (POST-01).
async function checkOwnItems(tx: Tx, ownerId: string, itemIds: string[]) {
  if (itemIds.length === 0) return;
  const owned = await tx
    .select({ id: items.id })
    .from(items)
    .where(and(inArray(items.id, itemIds), eq(items.ownerId, ownerId)));
  if (owned.length !== itemIds.length) {
    throw new AppError("ITEM_NOT_OWNED", "You can only tag your own gear.", { itemIds: ["You can only tag your own gear."] });
  }
}

async function setPostPhotos(tx: Tx, postId: string, photoIds: string[]) {
  await tx.delete(postPhotos).where(eq(postPhotos.postId, postId));
  await tx.insert(postPhotos).values(photoIds.map((photoId, position) => ({ postId, photoId, position })));
}

async function setPostItems(tx: Tx, postId: string, itemIds: string[]) {
  await tx.delete(postItems).where(eq(postItems.postId, postId));
  if (itemIds.length > 0) await tx.insert(postItems).values(itemIds.map((itemId) => ({ postId, itemId })));
}

async function lockOwnPost(tx: Tx, user: SessionUser, postId: string) {
  const [post] = await tx.select().from(posts).where(eq(posts.id, postId)).for("update");
  if (!post) throw new AppError("NOT_FOUND", "We couldn't find that post.");
  if (post.userId !== user.id) throw new AppError("FORBIDDEN", "That post isn't yours.");
  return post;
}

// POST /api/posts
export async function createPost(user: SessionUser, input: CreatePost): Promise<PostDetail> {
  let postId: string;
  try {
    postId = await withActor(user.id, async (tx) => {
      await claimPhotos(tx, user.id, input.photoIds);
      await checkOwnItems(tx, user.id, input.itemIds);
      const [post] = await tx
        .insert(posts)
        .values({ userId: user.id, hobbyId: input.hobbyId, title: input.title, caption: input.caption })
        .returning({ id: posts.id });
      await setPostPhotos(tx, post.id, input.photoIds);
      await setPostItems(tx, post.id, input.itemIds);
      return post.id;
    });
  } catch (error) {
    throw toPostError(error);
  }
  return getPostDetail(postId, user.id);
}

// PATCH /api/posts/:id (POST-09). Only the fields sent change.
export async function updatePost(user: SessionUser, postId: string, input: UpdatePost): Promise<PostDetail> {
  let dropped: string[] = [];
  try {
    dropped = await withActor(user.id, async (tx) => {
      await lockOwnPost(tx, user, postId);

      const { photoIds, itemIds, ...columns } = input;
      if (Object.keys(columns).length > 0) await tx.update(posts).set(columns).where(eq(posts.id, postId));
      if (itemIds) {
        await checkOwnItems(tx, user.id, itemIds);
        await setPostItems(tx, postId, itemIds);
      }

      if (!photoIds) return [];
      const before = await tx.select({ photoId: postPhotos.photoId }).from(postPhotos).where(eq(postPhotos.postId, postId));
      await claimPhotos(tx, user.id, photoIds, { postId });
      await setPostPhotos(tx, postId, photoIds);
      return removePhotoRows(
        tx,
        before.map((p) => p.photoId).filter((id) => !photoIds.includes(id)),
      );
    });
  } catch (error) {
    throw toPostError(error);
  }
  await deletePhotos(dropped);
  return getPostDetail(postId, user.id);
}

// DELETE /api/posts/:id (POST-09). The tagged gear stays; it belongs to the
// person, not the post.
export async function deletePost(user: SessionUser, postId: string): Promise<void> {
  const files = await withActor(user.id, async (tx) => {
    await lockOwnPost(tx, user, postId);
    const attached = await tx.select({ photoId: postPhotos.photoId }).from(postPhotos).where(eq(postPhotos.postId, postId));
    await tx.delete(posts).where(eq(posts.id, postId));
    return removePhotoRows(
      tx,
      attached.map((p) => p.photoId),
    );
  });
  await deletePhotos(files);
}
