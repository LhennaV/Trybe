// Items (gear) contract (TRD sections 8.3 and 10). Draft: changes need
// agreement from both owners.

import { z } from "zod";
import { pageQuerySchema } from "@/shared/contracts/common";
import { photoIdsSchema, photoSchema } from "@/shared/contracts/photos";

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

export const ITEM_CONDITIONS = ["like_new", "good", "fair", "worn"] as const;
export const itemConditionSchema = z.enum(ITEM_CONDITIONS);
export type ItemCondition = z.infer<typeof itemConditionSchema>;

// Shown in the app. Keep them short; they sit on small cards.
export const ITEM_CONDITION_LABELS: Record<ItemCondition, string> = {
  like_new: "Like new",
  good: "Good",
  fair: "Fair",
  worn: "Well loved",
};

// Changed only by trades, never by editing the item (ITEM-03, ITEM-04).
// reserved: in an accepted trade. traded: the trade completed.
export const ITEM_STATUSES = ["available", "reserved", "traded"] as const;
export const itemStatusSchema = z.enum(ITEM_STATUSES);
export type ItemStatus = z.infer<typeof itemStatusSchema>;

export const ITEM_NAME_MAX = 80;
export const LOOKING_FOR_MAX = 140;
// Proposed (TRD section 13 and 21).
export const ITEM_PHOTOS_MAX = 4;

// A category belongs to one hobby, for example "Wheels & kilns" under Pottery.
export const categorySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  hobbyId: z.uuid(),
});
export type Category = z.infer<typeof categorySchema>;

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export const itemSchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  name: z.string(),
  category: categorySchema,
  condition: itemConditionSchema,
  photos: z.array(photoSchema),
  upForTrade: z.boolean(),
  // What the owner wants in return (ITEM-02). Free text, shown to everyone.
  lookingFor: z.string().nullable(),
  status: itemStatusSchema,
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type Item = z.infer<typeof itemSchema>;

// The short version used inside trade offers and chat cards.
export const itemSummarySchema = z.object({
  id: z.uuid(),
  name: z.string(),
  condition: itemConditionSchema,
  thumbUrl: z.url().nullable(),
});
export type ItemSummary = z.infer<typeof itemSummarySchema>;

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

// POST /api/items (ITEM-01, ITEM-02)
export const createItemSchema = z.strictObject({
  name: z.string().trim().min(1, "Name your gear.").max(ITEM_NAME_MAX),
  categoryId: z.uuid(),
  condition: itemConditionSchema,
  photoIds: photoIdsSchema(1, ITEM_PHOTOS_MAX),
  upForTrade: z.boolean().default(false),
  // An empty string clears it.
  lookingFor: z.string().trim().max(LOOKING_FOR_MAX).optional(),
});
export type CreateItem = z.infer<typeof createItemSchema>;

// PATCH /api/items/:id (ITEM-05). Status can't be set here; trades set it.
export const updateItemSchema = createItemSchema.partial();
export type UpdateItem = z.infer<typeof updateItemSchema>;

// GET /api/me/items?status=&cursor=
export const myItemsQuerySchema = pageQuerySchema.extend({
  status: itemStatusSchema.optional(),
});
export type MyItemsQuery = z.infer<typeof myItemsQuerySchema>;
