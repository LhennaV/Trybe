import "server-only";
import { randomUUID } from "node:crypto";
import { and, eq, inArray, ne, notExists } from "drizzle-orm";
import { PHOTO_MAX_EDGE, PHOTO_THUMB_EDGE, type Photo } from "@/shared/contracts/photos";
import type { SessionUser } from "@/server/auth/session";
import { getDb } from "@/server/db";
import { itemPhotos, photos, postPhotos } from "@/server/db/schema";
import type { Tx } from "@/server/db/withActor";
import { AppError } from "@/server/errors";
import { processImage } from "@/server/uploads/image";
import { deletePhotos, publicPhotoUrl, uploadPhoto } from "@/server/uploads/storage";
import { checkPhotoFile } from "@/server/users/photo";

// Photos for items and posts (TRD section 13). Uploaded first with
// POST /api/photos, then attached to an item or post by id.

type PhotoRow = typeof photos.$inferSelect;

// URLs are built from the stored paths every time, never stored.
export function toPhoto(row: Pick<PhotoRow, "id" | "path" | "thumbPath" | "width" | "height">): Photo {
  return {
    id: row.id,
    url: publicPhotoUrl(row.path),
    thumbUrl: publicPhotoUrl(row.thumbPath),
    width: row.width,
    height: row.height,
  };
}

// POST /api/photos. Makes the full size and the thumbnail, stores both, and
// records the photo. Photos never attached are removed by the orphan cleanup
// (docs/database.md section 8).
export async function uploadContentPhoto(user: SessionUser, file: unknown): Promise<Photo> {
  checkPhotoFile(file);
  const [full, thumb] = await processImage(Buffer.from(await file.arrayBuffer()), [PHOTO_MAX_EDGE, PHOTO_THUMB_EDGE]);

  const base = `users/${user.id}/photos/${randomUUID()}`;
  const path = `${base}.webp`;
  const thumbPath = `${base}-thumb.webp`;
  await uploadPhoto(path, full.data);
  await uploadPhoto(thumbPath, thumb.data);

  try {
    const [row] = await getDb()
      .insert(photos)
      .values({ ownerId: user.id, path, thumbPath, width: full.width, height: full.height })
      .returning();
    return toPhoto(row);
  } catch (error) {
    await deletePhotos([path, thumbPath]);
    throw error;
  }
}

// Checks that every id is a photo this person uploaded that nothing else uses
// yet. When editing, the item or post being edited may keep its own photos.
// Locks the rows, so two requests can't attach the same photo at once.
export async function claimPhotos(
  tx: Tx,
  ownerId: string,
  photoIds: string[],
  editing: { itemId?: string; postId?: string } = {},
) {
  const onAnotherItem = tx
    .select({ id: itemPhotos.id })
    .from(itemPhotos)
    .where(
      editing.itemId
        ? and(eq(itemPhotos.photoId, photos.id), ne(itemPhotos.itemId, editing.itemId))
        : eq(itemPhotos.photoId, photos.id),
    );
  const onAnotherPost = tx
    .select({ id: postPhotos.id })
    .from(postPhotos)
    .where(
      editing.postId
        ? and(eq(postPhotos.photoId, photos.id), ne(postPhotos.postId, editing.postId))
        : eq(postPhotos.photoId, photos.id),
    );

  const usable = await tx
    .select({ id: photos.id })
    .from(photos)
    .where(
      and(
        inArray(photos.id, photoIds),
        eq(photos.ownerId, ownerId),
        notExists(onAnotherItem),
        notExists(onAnotherPost),
      ),
    )
    .for("update");

  if (usable.length !== photoIds.length) {
    const message = "Some of those photos can't be used here. Upload them again.";
    throw new AppError("VALIDATION_FAILED", message, { photoIds: [message] });
  }
}

// Deletes photo rows an edit or delete let go of. Returns their storage
// paths, to delete the files after the transaction commits.
export async function removePhotoRows(tx: Tx, photoIds: string[]): Promise<string[]> {
  if (photoIds.length === 0) return [];
  const removed = await tx
    .delete(photos)
    .where(inArray(photos.id, photoIds))
    .returning({ path: photos.path, thumbPath: photos.thumbPath });
  return removed.flatMap((p) => [p.path, p.thumbPath]);
}
