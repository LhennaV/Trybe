// Posts and feed contract (TRD sections 8.4 and 10). Draft: changes need
// agreement from both owners.

import { z } from "zod";
import { pageQuerySchema } from "@/shared/contracts/common";
import { hobbySchema } from "@/shared/contracts/hobbies";
import { itemSchema } from "@/shared/contracts/items";
import { photoIdsSchema, photoSchema } from "@/shared/contracts/photos";
import { userSummarySchema } from "@/shared/contracts/users";

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

export const POST_TITLE_MAX = 100;
export const POST_CAPTION_MAX = 2000;
export const POST_PHOTOS_MAX = 6;
export const POST_ITEMS_MAX = 10;

function uniqueIds(max: number, label: string) {
  return z
    .array(z.uuid())
    .max(max, `Up to ${max} ${label}.`)
    .refine((ids) => new Set(ids).size === ids.length, `Each one can only be added once.`);
}

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

// A card in the feed, on profiles, and in search results.
export const postCardSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  author: userSummarySchema,
  // One hobby per post (decided 2026-11-08). It drives the feed filter.
  hobby: hobbySchema,
  // The first photo. Its width and height decide a tall or short card.
  cover: photoSchema,
  // True when any tagged item is up for trade and available (POST-02).
  // Derived by the server; there is no manual toggle.
  upForTrade: z.boolean(),
  likeCount: z.number().int().min(0),
  // Always false when logged out.
  likedByMe: z.boolean(),
  savedByMe: z.boolean(),
  createdAt: z.iso.datetime({ offset: true }),
});
export type PostCard = z.infer<typeof postCardSchema>;

// GET /api/posts/:id
export const postDetailSchema = postCardSchema.extend({
  caption: z.string(),
  photos: z.array(photoSchema),
  // Gear used in the post (POST-01). "Propose a trade" shows only when one of
  // these is up for trade (POST-04).
  items: z.array(itemSchema),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type PostDetail = z.infer<typeof postDetailSchema>;

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

// POST /api/posts (POST-01). Tagged items must be the author's own.
export const createPostSchema = z.strictObject({
  title: z.string().trim().min(1, "Give your post a title.").max(POST_TITLE_MAX),
  caption: z.string().trim().max(POST_CAPTION_MAX).default(""),
  photoIds: photoIdsSchema(1, POST_PHOTOS_MAX),
  hobbyId: z.uuid("Pick a hobby."),
  itemIds: uniqueIds(POST_ITEMS_MAX, "items").default([]),
});
export type CreatePost = z.infer<typeof createPostSchema>;

// PATCH /api/posts/:id (POST-09)
export const updatePostSchema = createPostSchema.partial();
export type UpdatePost = z.infer<typeof updatePostSchema>;

// GET /api/feed?hobby=pottery&cursor=&limit= (POST-05). `hobby` is a slug.
export const feedQuerySchema = pageQuerySchema.extend({
  hobby: z.string().min(1).optional(),
});
export type FeedQuery = z.infer<typeof feedQuerySchema>;
