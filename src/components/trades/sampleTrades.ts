import type { Trade } from "./tradeModel";

// Sample trades from the Figma prototype, seen as Storm (@stormi).
export const SAMPLE_TRADES: Trade[] = [
  {
    id: "ae1-shimpo",
    other: { handle: "kiln.and.co", rating: 4.9, tradeCount: 23 },
    status: "pending",
    lastActivity: "2:31 PM",
    offers: [
      {
        id: "offer-1",
        madeBy: "me",
        myItems: ["Canon AE-1 + 50mm"],
        theirItems: ["Shimpo Aspire wheel"],
        cash: { amount: 1500, from: "me" },
        time: "2:14 PM",
      },
      {
        id: "offer-2",
        madeBy: "them",
        myItems: ["Canon AE-1 + 50mm"],
        theirItems: ["Shimpo Aspire wheel"],
        cash: { amount: 1000, from: "me" },
        time: "2:31 PM",
      },
    ],
    messages: [
      { id: "m1", kind: "offer", offerId: "offer-1" },
      {
        id: "m2",
        kind: "text",
        from: "them",
        body: "Hi! An AE-1 is exactly what I was hoping for 😊 Heads up, the splash pan has a small hairline crack.",
        time: "2:31 PM",
      },
      { id: "m3", kind: "text", from: "them", body: "Would you do PHP 1,000 instead because of the crack?", time: "2:31 PM" },
      { id: "m4", kind: "offer", offerId: "offer-2" },
    ],
  },
  {
    id: "hooks-lace",
    other: { handle: "mika.makes", rating: 0, tradeCount: 0 },
    status: "accepted",
    lastActivity: "Yesterday",
    offers: [
      {
        id: "offer-3",
        madeBy: "them",
        myItems: ["Crochet hook set (12 pcs)"],
        theirItems: ["Bobbin lace kit"],
        cash: { amount: 200, from: "them" },
        time: "Yesterday",
      },
    ],
    messages: [
      { id: "m5", kind: "offer", offerId: "offer-3" },
      { id: "m6", kind: "system", body: "You accepted this offer. Set up a meetup next." },
    ],
  },
  {
    id: "yashica-wheel",
    other: { handle: "filmbyjo", rating: 5, tradeCount: 12 },
    status: "pending",
    lastActivity: "Mon",
    offers: [
      {
        id: "offer-4",
        madeBy: "me",
        myItems: ["Crochet hook set (12 pcs)"],
        theirItems: ["Yashica Electro 35"],
        time: "Mon",
      },
    ],
    messages: [{ id: "m7", kind: "offer", offerId: "offer-4" }],
  },
];

export type MessageRequest = {
  id: string;
  handle: string;
  joined: string;
  tradeCount: number;
  age: string;
  preview: string;
  // Set by the server's contact info check (CHAT-04).
  asksForContact: boolean;
};

export const SAMPLE_REQUESTS: MessageRequest[] = [
  {
    id: "req-mika",
    handle: "mika.makes",
    joined: "Joined 2 weeks ago",
    tradeCount: 0,
    age: "2h",
    preview: "Hi! Is the crochet hook set still up for trade? I have a bobbin lace kit, and I could add PHP 200.",
    asksForContact: false,
  },
  {
    id: "req-thrift",
    handle: "thrift.n.tinker",
    joined: "Joined today",
    tradeCount: 0,
    age: "5h",
    preview: "hey can u send ur number? easier to talk there",
    asksForContact: true,
  },
];

// Stand-in for GET /api/trades/:id.
export function getSampleTrade(id: string) {
  return SAMPLE_TRADES.find((trade) => trade.id === id) ?? null;
}
