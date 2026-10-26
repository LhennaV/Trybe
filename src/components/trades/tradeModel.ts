// Trade types and display helpers. Plain TS with no React, so the same rules
// can move into src/shared once the trade contracts exist.

export type Side = "me" | "them";

export type TradeStatus = "pending" | "accepted" | "completed" | "declined" | "cancelled";

export type TradeOffer = {
  id: string;
  madeBy: Side;
  myItems: string[];
  theirItems: string[];
  cash?: { amount: number; from: Side };
  time: string;
};

export type ChatMessage =
  | { id: string; kind: "text"; from: Side; body: string; time: string; asksForContact?: boolean }
  | { id: string; kind: "offer"; offerId: string }
  | { id: string; kind: "system"; body: string };

export type Trade = {
  id: string;
  other: { handle: string; rating: number; tradeCount: number };
  status: TradeStatus;
  offers: TradeOffer[];
  messages: ChatMessage[];
  lastActivity: string;
};

const pesoFormat = new Intl.NumberFormat("en-US");

// Money is always shown as "PHP 1,500" to match the designs.
export function formatPHP(amount: number) {
  return `PHP ${pesoFormat.format(amount)}`;
}

export function currentOffer(trade: Trade): TradeOffer | undefined {
  return trade.offers[trade.offers.length - 1];
}

// Only the person who did NOT make the current offer can accept, decline, or
// counter it (TRD-05). The server checks this too; this only decides what to show.
export function canRespond(trade: Trade) {
  return trade.status === "pending" && currentOffer(trade)?.madeBy === "them";
}

// "Canon AE-1 + PHP 1,500 for Shimpo Aspire wheel", from the viewer's side.
export function describeOffer(offer: TradeOffer) {
  const give = [...offer.myItems];
  const get = [...offer.theirItems];
  if (offer.cash?.from === "me") give.push(formatPHP(offer.cash.amount));
  if (offer.cash?.from === "them") get.push(formatPHP(offer.cash.amount));
  return `${give.join(" + ") || "Nothing"} for ${get.join(" + ") || "nothing"}`;
}

export const STATUS_LABELS: Record<TradeStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};
