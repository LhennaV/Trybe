import "server-only";
import { and, asc, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";
import type { Page } from "@/shared/contracts/common";
import type {
  OfferItem,
  Side,
  TradeDetail,
  TradeOffer,
  TradeSummary,
  TradesQuery,
} from "@/shared/contracts/trades";
import { getDb } from "@/server/db";
import { itemPhotos, items, meetupSpots, photos, ratings, tradeOfferItems, tradeOffers, trades, users } from "@/server/db/schema";
import { AppError } from "@/server/errors";
import { decodeCursor, encodeCursor } from "@/server/http/cursor";
import { toMeetupSpot } from "@/server/trades/meetups";
import { canRespond } from "@/server/trades/stateMachine";
import { publicPhotoUrl } from "@/server/uploads/storage";
import { toUserSummary } from "@/server/users/summary";

// Reading trades (TRD sections 8.6 and 10). Everything is written from the
// viewer's side: "me" is the person asking, "them" the other person. Only the
// two people in a trade can read it; to anyone else it doesn't exist (404),
// so trade ids can't be probed.

type TradeRow = typeof trades.$inferSelect;
type OfferRow = typeof tradeOffers.$inferSelect;
type DbSide = "initiator" | "recipient";
type Line = { offerId: string; item: OfferItem; side: DbSide };

function viewerSide(trade: TradeRow, viewerId: string): DbSide {
  return trade.initiatorId === viewerId ? "initiator" : "recipient";
}

function otherId(trade: TradeRow, viewerId: string): string | null {
  return trade.initiatorId === viewerId ? trade.recipientId : trade.initiatorId;
}

// MEET-01: the suggester counts as confirmed; the other person confirms.
function meetupFor(trade: TradeRow, spot: typeof meetupSpots.$inferSelect | null, viewerId: string) {
  if (!trade.meetupAt || !spot) {
    return { spot: null, at: null, proposedBy: null, confirmedByMe: false, confirmedByThem: false };
  }
  const suggestedByMe = trade.meetupProposedBy === viewerId;
  const otherConfirmed = trade.meetupConfirmedAt !== null;
  return {
    spot: toMeetupSpot(spot),
    at: trade.meetupAt.toISOString(),
    proposedBy: whoIs(trade.meetupProposedBy, viewerId),
    confirmedByMe: suggestedByMe || otherConfirmed,
    confirmedByThem: !suggestedByMe || otherConfirmed,
  };
}

function completionFor(trade: TradeRow, viewerId: string) {
  const mine = viewerSide(trade, viewerId) === "initiator";
  const [me, them] = mine
    ? [trade.initiatorConfirmedAt, trade.recipientConfirmedAt]
    : [trade.recipientConfirmedAt, trade.initiatorConfirmedAt];
  return { confirmedByMe: me !== null, confirmedByThem: them !== null };
}

// "me" or "them" for a user id; a deleted account (null) is always "them".
function whoIs(userId: string | null, viewerId: string): Side {
  return userId === viewerId ? "me" : "them";
}

// The items of these offers, with the item's condition and cover thumbnail
// when it still exists, or just the saved name when it was deleted.
async function loadLines(offerIds: string[]): Promise<Line[]> {
  if (offerIds.length === 0) return [];
  const rows = await getDb()
    .select({
      offerId: tradeOfferItems.offerId,
      itemId: tradeOfferItems.itemId,
      itemName: tradeOfferItems.itemName,
      side: tradeOfferItems.side,
      condition: items.condition,
      thumbPath: photos.thumbPath,
    })
    .from(tradeOfferItems)
    .leftJoin(items, eq(items.id, tradeOfferItems.itemId))
    .leftJoin(itemPhotos, and(eq(itemPhotos.itemId, items.id), eq(itemPhotos.position, 0)))
    .leftJoin(photos, eq(photos.id, itemPhotos.photoId))
    .where(inArray(tradeOfferItems.offerId, offerIds))
    .orderBy(asc(tradeOfferItems.itemName), asc(tradeOfferItems.id));

  return rows.map((r) => ({
    offerId: r.offerId,
    side: r.side,
    item: {
      id: r.itemId,
      name: r.itemName,
      condition: r.itemId ? r.condition : null,
      thumbUrl: r.itemId && r.thumbPath ? publicPhotoUrl(r.thumbPath) : null,
    },
  }));
}

function toOffer(offer: OfferRow, lines: Line[], mySide: DbSide, viewerId: string): TradeOffer {
  const mine = lines.filter((l) => l.offerId === offer.id);
  return {
    id: offer.id,
    madeBy: whoIs(offer.madeBy, viewerId),
    myItems: mine.filter((l) => l.side === mySide).map((l) => l.item),
    theirItems: mine.filter((l) => l.side !== mySide).map((l) => l.item),
    cash:
      offer.cashAmount !== null && offer.cashFrom !== null
        ? { amount: offer.cashAmount, from: offer.cashFrom === mySide ? "me" : "them" }
        : null,
    createdAt: offer.createdAt.toISOString(),
  };
}

// Summaries for these trades, in the same order. Every trade must have the
// viewer as a member (the callers filter on that).
async function buildSummaries(rows: TradeRow[], viewerId: string, offersById: Map<string, TradeOffer>) {
  const otherIds = [...new Set(rows.map((t) => otherId(t, viewerId)).filter((id): id is string => id !== null))];
  const people =
    otherIds.length === 0 ? [] : await getDb().select().from(users).where(inArray(users.id, otherIds));
  const byId = new Map(people.map((p) => [p.id, toUserSummary(p)]));

  return rows.map((trade): TradeSummary => {
    const current = offersById.get(trade.currentOfferId ?? "");
    if (!current) throw new Error(`Trade ${trade.id} has no current offer.`);
    const other = otherId(trade, viewerId);
    return {
      id: trade.id,
      status: trade.status,
      other: other ? (byId.get(other) ?? null) : null,
      currentOffer: current,
      // TRD-04 and TRD-05: false while pending means "waiting for them".
      canRespond: canRespond(trade.status, current.madeBy === "me" ? "maker" : "responder"),
      updatedAt: trade.updatedAt.toISOString(),
    };
  });
}

async function loadOffers(where: SQL, trade: (offer: OfferRow) => TradeRow, viewerId: string) {
  const offers = await getDb()
    .select()
    .from(tradeOffers)
    .where(where)
    .orderBy(asc(tradeOffers.createdAt), asc(tradeOffers.id));
  const lines = await loadLines(offers.map((o) => o.id));
  return offers.map((o) => toOffer(o, lines, viewerSide(trade(o), viewerId), viewerId));
}

const isMember = (viewerId: string) => or(eq(trades.initiatorId, viewerId), eq(trades.recipientId, viewerId));

// GET /api/trades?status=&cursor=&limit=. The viewer's trades, most recently
// changed first.
export async function listTrades(viewerId: string, query: TradesQuery): Promise<Page<TradeSummary>> {
  const cursor = decodeCursor(query.cursor);
  const conditions: (SQL | undefined)[] = [isMember(viewerId)];
  if (query.status) conditions.push(eq(trades.status, query.status));
  if (cursor) {
    conditions.push(sql`(${trades.updatedAt}, ${trades.id}) < (${cursor.at}::timestamptz, ${cursor.id}::uuid)`);
  }

  // One extra row tells us whether there is a next page.
  const rows = await getDb()
    .select({ trade: trades, at: sql<string>`${trades.updatedAt}::text` })
    .from(trades)
    .where(and(...conditions))
    .orderBy(desc(trades.updatedAt), desc(trades.id))
    .limit(query.limit + 1);

  const page = rows.slice(0, query.limit);
  const pageTrades = page.map((r) => r.trade);
  const tradeById = new Map(pageTrades.map((t) => [t.id, t]));
  const currentIds = pageTrades.map((t) => t.currentOfferId).filter((id): id is string => id !== null);

  const offers =
    currentIds.length === 0
      ? []
      : await loadOffers(inArray(tradeOffers.id, currentIds), (o) => tradeById.get(o.tradeId)!, viewerId);
  const last = page.at(-1);
  return {
    items: await buildSummaries(pageTrades, viewerId, new Map(offers.map((o) => [o.id, o]))),
    nextCursor: rows.length > query.limit && last ? encodeCursor({ at: last.at, id: last.trade.id }) : null,
  };
}

// GET /api/trades/:id. Every offer, oldest first (TRD-07).
export async function getTrade(viewerId: string, tradeId: string): Promise<TradeDetail> {
  const [trade] = await getDb()
    .select()
    .from(trades)
    .where(and(eq(trades.id, tradeId), isMember(viewerId)))
    .limit(1);
  if (!trade) throw new AppError("TRADE_NOT_FOUND");

  const [offers, [myRating], [spot]] = await Promise.all([
    loadOffers(eq(tradeOffers.tradeId, trade.id), () => trade, viewerId),
    getDb()
      .select({ id: ratings.id })
      .from(ratings)
      .where(and(eq(ratings.tradeId, trade.id), eq(ratings.raterId, viewerId)))
      .limit(1),
    trade.meetupSpotId
      ? getDb().select().from(meetupSpots).where(eq(meetupSpots.id, trade.meetupSpotId)).limit(1)
      : Promise.resolve([]),
  ]);
  const [summary] = await buildSummaries([trade], viewerId, new Map(offers.map((o) => [o.id, o])));

  return {
    ...summary,
    offers,
    meetup: meetupFor(trade, spot ?? null, viewerId),
    // MEET-05: each side's handoff confirmation.
    completion: completionFor(trade, viewerId),
    cancelledBy: trade.cancelledBy ? whoIs(trade.cancelledBy, viewerId) : null,
    cancelReason: trade.cancelReason,
    ratedByMe: myRating !== undefined,
    createdAt: trade.createdAt.toISOString(),
  };
}
