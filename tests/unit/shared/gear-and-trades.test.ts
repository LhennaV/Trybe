import { describe, expect, it } from "vitest";
import { ITEM_PHOTOS_MAX, createItemSchema, updateItemSchema } from "@/shared/contracts/items";
import { POST_PHOTOS_MAX, createPostSchema, feedQuerySchema } from "@/shared/contracts/posts";
import {
  cancelTradeSchema,
  offerTermsSchema,
  sendMessageSchema,
  submitRatingSchema,
} from "@/shared/contracts/trades";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const ids = (count: number, from = 1) => Array.from({ length: count }, (_, i) => id(from + i));

describe("createItemSchema", () => {
  const item = { name: "Shimpo wheel", categoryId: id(1), condition: "good", photoIds: [id(2)] };

  it("accepts a new item and defaults upForTrade to false", () => {
    expect(createItemSchema.parse(item)).toMatchObject({ upForTrade: false });
  });

  it("needs at least one photo and allows up to the limit (ITEM-01)", () => {
    expect(createItemSchema.safeParse({ ...item, photoIds: [] }).success).toBe(false);
    expect(createItemSchema.safeParse({ ...item, photoIds: ids(ITEM_PHOTOS_MAX) }).success).toBe(true);
    expect(createItemSchema.safeParse({ ...item, photoIds: ids(ITEM_PHOTOS_MAX + 1) }).success).toBe(false);
  });

  it("rejects the same photo twice and unknown conditions", () => {
    expect(createItemSchema.safeParse({ ...item, photoIds: [id(2), id(2)] }).success).toBe(false);
    expect(createItemSchema.safeParse({ ...item, condition: "mint" }).success).toBe(false);
  });

  it("never lets an edit set the status (ITEM-03)", () => {
    expect(updateItemSchema.safeParse({ status: "available" }).success).toBe(false);
  });
});

describe("createPostSchema", () => {
  const post = { title: "Mug set", photoIds: [id(1)], hobbyId: id(2) };

  it("defaults caption and tagged items", () => {
    expect(createPostSchema.parse(post)).toMatchObject({ caption: "", itemIds: [] });
  });

  it("needs exactly one hobby and allows up to 6 photos (POST-01)", () => {
    expect(createPostSchema.safeParse({ ...post, hobbyId: undefined }).success).toBe(false);
    expect(createPostSchema.safeParse({ ...post, hobbyIds: [id(2), id(3)] }).success).toBe(false);
    expect(createPostSchema.safeParse({ ...post, photoIds: ids(POST_PHOTOS_MAX) }).success).toBe(true);
    expect(createPostSchema.safeParse({ ...post, photoIds: ids(POST_PHOTOS_MAX + 1) }).success).toBe(false);
  });

  it("has no manual for-trade toggle (POST-02)", () => {
    expect(createPostSchema.safeParse({ ...post, upForTrade: true }).success).toBe(false);
  });
});

describe("feedQuerySchema", () => {
  it("reads the hobby filter and pagination", () => {
    expect(feedQuerySchema.parse({ hobby: "pottery", limit: "10" })).toEqual({ hobby: "pottery", limit: 10 });
  });
});

describe("offerTermsSchema", () => {
  const terms = { giveItemIds: [id(1)], wantItemIds: [id(2)] };

  it("accepts an item swap with an optional cash top-up (TRD-01, TRD-02)", () => {
    expect(offerTermsSchema.safeParse(terms).success).toBe(true);
    expect(offerTermsSchema.safeParse({ ...terms, cash: { amount: 1500, from: "me" } }).success).toBe(true);
  });

  it("needs at least one item on each side", () => {
    expect(offerTermsSchema.safeParse({ ...terms, giveItemIds: [] }).success).toBe(false);
    expect(offerTermsSchema.safeParse({ ...terms, wantItemIds: [] }).success).toBe(false);
  });

  it("rejects an item on both sides", () => {
    expect(offerTermsSchema.safeParse({ giveItemIds: [id(1)], wantItemIds: [id(1)] }).success).toBe(false);
  });

  it("only takes positive whole pesos with a direction", () => {
    for (const cash of [{ amount: 0, from: "me" }, { amount: 10.5, from: "me" }, { amount: 100 }]) {
      expect(offerTermsSchema.safeParse({ ...terms, cash }).success, JSON.stringify(cash)).toBe(false);
    }
  });
});

describe("other trade requests", () => {
  it("only lets people cancel as withdrawn or no-show", () => {
    expect(cancelTradeSchema.safeParse({ reason: "no_show" }).success).toBe(true);
    expect(cancelTradeSchema.safeParse({ reason: "meetup_expired" }).success).toBe(false);
  });

  it("rejects blank messages", () => {
    expect(sendMessageSchema.safeParse({ body: "   " }).success).toBe(false);
  });

  it("only takes tags from the fixed list, once each", () => {
    expect(submitRatingSchema.safeParse({ score: 5, tags: ["On time", "Friendly"] }).success).toBe(true);
    expect(submitRatingSchema.safeParse({ score: 5, tags: ["Great vibes"] }).success).toBe(false);
    expect(submitRatingSchema.safeParse({ score: 5, tags: ["On time", "On time"] }).success).toBe(false);
  });

  it("takes 1 to 5 stars", () => {
    expect(submitRatingSchema.safeParse({ score: 5 }).success).toBe(true);
    expect(submitRatingSchema.safeParse({ score: 0 }).success).toBe(false);
    expect(submitRatingSchema.safeParse({ score: 4.5 }).success).toBe(false);
  });
});
