// Trades, chat, meetup, and ratings contract (TRD sections 8.6 to 8.8, 10,
// and 11). Draft: changes need agreement from both owners.
//
// Responses are written from the viewer's side: "me" is the person asking,
// "them" is the other person. The server works out who is who, so every
// client shows the same thing without converting initiator and recipient.

import { z } from "zod";
import { pageQuerySchema } from "@/shared/contracts/common";
import { itemSummarySchema } from "@/shared/contracts/items";
import { userSummarySchema } from "@/shared/contracts/users";

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

export const TRADE_STATUSES = ["pending", "accepted", "completed", "declined", "cancelled"] as const;
export const tradeStatusSchema = z.enum(TRADE_STATUSES);
export type TradeStatus = z.infer<typeof tradeStatusSchema>;

export const SIDES = ["me", "them"] as const;
export const sideSchema = z.enum(SIDES);
export type Side = z.infer<typeof sideSchema>;

// Why a trade ended early. The first two are chosen by a person; the rest are
// set by the server.
export const CANCEL_REASONS = ["withdrawn", "no_show", "item_unavailable", "meetup_expired"] as const;
export const cancelReasonSchema = z.enum(CANCEL_REASONS);
export type CancelReason = z.infer<typeof cancelReasonSchema>;

// Cash is agreed in the app and handed over in person. Whole pesos only.
export const CASH_MAX = 1_000_000;
export const cashSchema = z.object({
  amount: z.number().int("Whole pesos only.").min(1).max(CASH_MAX),
  from: sideSchema,
});
export type Cash = z.infer<typeof cashSchema>;

export const OFFER_ITEMS_MAX = 10;
export const MESSAGE_MAX = 1000;
export const CANCEL_NOTE_MAX = 500;
export const RATING_NOTE_MAX = 500;
export const RATING_TAGS_MAX = 5;

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export const tradeOfferSchema = z.object({
  id: z.uuid(),
  madeBy: sideSchema,
  myItems: z.array(itemSummarySchema),
  theirItems: z.array(itemSummarySchema),
  cash: cashSchema.nullable(),
  createdAt: z.iso.datetime({ offset: true }),
});
export type TradeOffer = z.infer<typeof tradeOfferSchema>;

export const meetupSpotSchema = z.object({
  id: z.uuid(),
  city: z.string(),
  name: z.string(),
  description: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type MeetupSpot = z.infer<typeof meetupSpotSchema>;

// A row in GET /api/trades
export const tradeSummarySchema = z.object({
  id: z.uuid(),
  status: tradeStatusSchema,
  other: userSummarySchema,
  currentOffer: tradeOfferSchema,
  // True when the viewer can accept, decline, or counter right now (TRD-04).
  // False means "waiting for them" while pending (TRD-05).
  canRespond: z.boolean(),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type TradeSummary = z.infer<typeof tradeSummarySchema>;

// GET /api/trades/:id
export const tradeDetailSchema = tradeSummarySchema.extend({
  // Oldest first. The last one is currentOffer (TRD-07).
  offers: z.array(tradeOfferSchema),
  meetup: z.object({
    spot: meetupSpotSchema.nullable(),
    at: z.iso.datetime({ offset: true }).nullable(),
    proposedBy: sideSchema.nullable(),
    confirmedByMe: z.boolean(),
    confirmedByThem: z.boolean(),
  }),
  completion: z.object({ confirmedByMe: z.boolean(), confirmedByThem: z.boolean() }),
  cancelledBy: sideSchema.nullable(),
  cancelReason: cancelReasonSchema.nullable(),
  // Whether the viewer has rated this trade (RATE-01). Ratings themselves
  // stay hidden until both rate or 7 days pass (RATE-02).
  ratedByMe: z.boolean(),
  createdAt: z.iso.datetime({ offset: true }),
});
export type TradeDetail = z.infer<typeof tradeDetailSchema>;

// GET /api/trades/:id/messages (CHAT-01)
const messageBase = { id: z.uuid(), createdAt: z.iso.datetime({ offset: true }) };
export const messageSchema = z.discriminatedUnion("type", [
  z.object({
    ...messageBase,
    type: z.literal("text"),
    from: sideSchema,
    body: z.string(),
    // Set by the server when the text asks for a phone number or another app (CHAT-04).
    asksForContact: z.boolean(),
  }),
  z.object({ ...messageBase, type: z.literal("offer"), from: sideSchema, offerId: z.uuid() }),
  z.object({ ...messageBase, type: z.literal("system"), body: z.string() }),
]);
export type Message = z.infer<typeof messageSchema>;

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

function itemIds(label: string) {
  return z
    .array(z.uuid())
    .min(1, `Pick at least one ${label}.`)
    .max(OFFER_ITEMS_MAX, `Up to ${OFFER_ITEMS_MAX} items.`)
    .refine((ids) => new Set(ids).size === ids.length, "Each item can only be picked once.");
}

// What one side offers (TRD-01, TRD-02). Both sides give at least one item;
// cash is an optional top-up from either side.
export const offerTermsSchema = z
  .strictObject({
    giveItemIds: itemIds("of your items"),
    wantItemIds: itemIds("of their items"),
    cash: cashSchema.optional(),
  })
  .refine((t) => !t.giveItemIds.some((id) => t.wantItemIds.includes(id)), {
    message: "An item can't be on both sides.",
    path: ["wantItemIds"],
  });
export type OfferTerms = z.infer<typeof offerTermsSchema>;

// POST /api/trades. The other person is the owner of wantItemIds.
export const proposeTradeSchema = offerTermsSchema;
export type ProposeTrade = OfferTerms;

// POST /api/trades/:id/counter (TRD-03)
export const counterOfferSchema = offerTermsSchema;
export type CounterOffer = OfferTerms;

// POST /api/trades/:id/cancel (TRD-08, MEET-06). no_show also files a report.
export const cancelTradeSchema = z.strictObject({
  reason: z.enum(["withdrawn", "no_show"]),
  note: z.string().trim().max(CANCEL_NOTE_MAX).optional(),
});
export type CancelTrade = z.infer<typeof cancelTradeSchema>;

// POST /api/trades/:id/meetup (MEET-01)
export const setMeetupSchema = z.strictObject({
  spotId: z.uuid(),
  meetupAt: z.iso.datetime({ offset: true }),
});
export type SetMeetup = z.infer<typeof setMeetupSchema>;

// POST /api/trades/:id/messages
export const sendMessageSchema = z.strictObject({
  body: z.string().trim().min(1, "Write something first.").max(MESSAGE_MAX),
});
export type SendMessage = z.infer<typeof sendMessageSchema>;

// The only tags a rating can carry, from the rating screen (decided
// 2026-11-08). A fixed list keeps them countable and needs no moderation.
export const RATING_TAGS = [
  "Item as described",
  "On time",
  "Friendly",
  "Easy to negotiate",
  "Good meetup spot",
] as const;
export const ratingTagSchema = z.enum(RATING_TAGS);
export type RatingTag = z.infer<typeof ratingTagSchema>;

// POST /api/trades/:id/ratings (RATE-01)
export const submitRatingSchema = z.strictObject({
  score: z.number().int().min(1).max(5),
  tags: z
    .array(ratingTagSchema)
    .max(RATING_TAGS_MAX)
    .refine((tags) => new Set(tags).size === tags.length, "Each tag can only be picked once.")
    .default([]),
  note: z.string().trim().max(RATING_NOTE_MAX).optional(),
});
export type SubmitRating = z.infer<typeof submitRatingSchema>;

// GET /api/trades?status=&cursor=
export const tradesQuerySchema = pageQuerySchema.extend({
  status: tradeStatusSchema.optional(),
});
export type TradesQuery = z.infer<typeof tradesQuerySchema>;
