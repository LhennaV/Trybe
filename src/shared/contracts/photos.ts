// Photo contract (TRD section 13). Draft: changes need agreement from both
// owners. Requests refer to an uploaded photo by its id.

import { z } from "zod";

// ---------------------------------------------------------------------------
// Upload rules (decided 2026-11-11)
// ---------------------------------------------------------------------------
//
// 1. The browser shrinks the photo first with `resizeForUpload()` from
//    src/shared/images/resizeForUpload.ts: longest side 1600px, JPEG. That
//    keeps uploads under Vercel's 4.5 MB request limit and turns iPhone HEIC
//    photos into JPEG (the server can't read HEIC).
// 2. The server re-encodes to WebP with sharp, which removes EXIF and GPS,
//    and refuses anything that isn't really a JPEG, PNG, or WebP image.

// The biggest photo someone can pick on their phone, before shrinking (TRD
// section 13, Proposed).
export const PHOTO_PICK_MAX_BYTES = 10 * 1024 * 1024;
// What the browser lets people pick. HEIC is fine here: the browser converts it.
export const PHOTO_PICK_TYPES = "image/jpeg,image/png,image/webp,image/heic,image/heif";

// The longest side after shrinking, in the browser and on the server.
export const PHOTO_MAX_EDGE = 1600;
export const PHOTO_THUMB_EDGE = 400;
// Profile photos are only shown small, so one size is enough.
export const AVATAR_EDGE = 400;

// What the API accepts after shrinking. Under Vercel's 4.5 MB request limit.
export const PHOTO_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const PHOTO_UPLOAD_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// Multipart form field name for uploads: POST /api/me/photo with `photo`.
export const PHOTO_FIELD = "photo";

// ---------------------------------------------------------------------------
// Responses and requests
// ---------------------------------------------------------------------------

// A stored photo. Every upload is resized into a thumbnail (about 400px) and
// a full size (about 1600px), both WebP with EXIF and GPS removed.
// width and height are the full size, so the feed can pick a tall or short card.
export const photoSchema = z.object({
  id: z.uuid(),
  url: z.url(),
  thumbUrl: z.url(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});
export type Photo = z.infer<typeof photoSchema>;

// A list of uploaded photo ids, in display order (the first is the cover).
export function photoIdsSchema(min: number, max: number) {
  return z
    .array(z.uuid())
    .min(min, min === 1 ? "Add a photo." : `Add at least ${min} photos.`)
    .max(max, `Up to ${max} photos.`)
    .refine((ids) => new Set(ids).size === ids.length, "Each photo can only be added once.");
}
