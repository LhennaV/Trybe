import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { AVATAR_EDGE, PHOTO_UPLOAD_MAX_BYTES, PHOTO_UPLOAD_TYPES } from "@/shared/contracts/photos";
import type { Me } from "@/shared/contracts/users";
import type { SessionUser } from "@/server/auth/session";
import { users } from "@/server/db/schema";
import { withActor } from "@/server/db/withActor";
import { AppError } from "@/server/errors";
import { processImage } from "@/server/uploads/image";
import { deletePhotos, photoPathFromUrl, uploadPhoto } from "@/server/uploads/storage";
import { getMe } from "@/server/users/profile";

function photoError(message: string) {
  return new AppError("VALIDATION_FAILED", message, { photo: [message] });
}

// Checks the upload before any processing. The bytes are checked again by
// processImage(); this only turns away the obvious cases cheaply.
export function checkPhotoFile(file: unknown): asserts file is File {
  if (!(file instanceof File) || file.size === 0) throw photoError("Pick a photo to upload.");
  // The browser shrinks photos with resizeForUpload() first, so this only
  // happens when that step was skipped.
  if (file.size > PHOTO_UPLOAD_MAX_BYTES) throw photoError("That photo is too big. Try a smaller one.");
  if (!(PHOTO_UPLOAD_TYPES as readonly string[]).includes(file.type)) {
    throw photoError("Upload a JPEG, PNG, or WebP photo.");
  }
}

async function currentPhotoUrl(userId: string, tx: Parameters<Parameters<typeof withActor>[1]>[0]) {
  const [row] = await tx.select({ photoUrl: users.photoUrl }).from(users).where(eq(users.id, userId)).for("update");
  if (!row) throw new AppError("PROFILE_NOT_FOUND");
  return row.photoUrl;
}

// POST /api/me/photo (PROF-06). Stores a new profile photo and removes the
// old one. A new file name every time, so caches never show the old photo.
export async function setProfilePhoto(user: SessionUser, file: unknown): Promise<Me> {
  checkPhotoFile(file);
  const [avatar] = await processImage(Buffer.from(await file.arrayBuffer()), [AVATAR_EDGE]);

  const path = `users/${user.id}/avatar-${randomUUID()}.webp`;
  const url = await uploadPhoto(path, avatar.data);

  let oldUrl: string | null;
  try {
    oldUrl = await withActor(user.id, async (tx) => {
      const previous = await currentPhotoUrl(user.id, tx);
      await tx.update(users).set({ photoUrl: url }).where(eq(users.id, user.id));
      return previous;
    });
  } catch (error) {
    // The profile didn't change, so the new file isn't used by anything.
    await deletePhotos([path]);
    throw error;
  }

  const oldPath = oldUrl ? photoPathFromUrl(oldUrl) : null;
  if (oldPath) await deletePhotos([oldPath]);
  return getMe(user);
}

// DELETE /api/me/photo. Back to the initials avatar.
export async function removeProfilePhoto(user: SessionUser): Promise<Me> {
  const oldUrl = await withActor(user.id, async (tx) => {
    const previous = await currentPhotoUrl(user.id, tx);
    await tx.update(users).set({ photoUrl: null }).where(eq(users.id, user.id));
    return previous;
  });

  const oldPath = oldUrl ? photoPathFromUrl(oldUrl) : null;
  if (oldPath) await deletePhotos([oldPath]);
  return getMe(user);
}
