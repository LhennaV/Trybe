// Photo contract (TRD section 13). Draft: changes need agreement from both
// owners. How photos get uploaded is decided with the image pipeline in
// Phase 2; requests refer to an uploaded photo by its id.

import { z } from "zod";

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
