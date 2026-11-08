// Mock API data built from the shared contracts (implementation plan, Phase 0).
// Every value has the exact shape the API returns, so screens can be built
// before an endpoint exists and swapped to the real call later.
// tests/unit/shared/mocks.test.ts checks all of it against the schemas.
//
// Same people and gear as the Figma prototype, seen as Storm (@stormi).
// Photos come from picsum.photos so cards have real images in dev.

import type { Hobby } from "@/shared/contracts/hobbies";
import type { Category, Item } from "@/shared/contracts/items";
import type { Photo } from "@/shared/contracts/photos";
import { postCardSchema, type PostCard, type PostDetail } from "@/shared/contracts/posts";
import type { Message, TradeDetail, TradeOffer } from "@/shared/contracts/trades";
import type { Me, UserSummary } from "@/shared/contracts/users";

// Fixed ids so links between mocks (and tests) stay stable.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

// ---------------------------------------------------------------------------
// Hobbies and categories (names match the seeded list in migration 0003)
// ---------------------------------------------------------------------------

export const MOCK_HOBBIES = {
  pottery: { id: id(101), name: "Pottery", slug: "pottery" },
  filmPhotography: { id: id(102), name: "Film photography", slug: "film-photography" },
  crochet: { id: id(103), name: "Crochet", slug: "crochet" },
} satisfies Record<string, Hobby>;

export const MOCK_CATEGORIES = {
  wheelsAndKilns: { id: id(201), name: "Wheels & kilns", hobbyId: MOCK_HOBBIES.pottery.id },
  handTools: { id: id(202), name: "Hand tools", hobbyId: MOCK_HOBBIES.pottery.id },
  filmCameras: { id: id(203), name: "Film cameras", hobbyId: MOCK_HOBBIES.filmPhotography.id },
  hooksAndYarn: { id: id(204), name: "Hooks & yarn", hobbyId: MOCK_HOBBIES.crochet.id },
} satisfies Record<string, Category>;

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------

export const MOCK_USERS = {
  storm: {
    id: id(1),
    handle: "stormi",
    displayName: "Storm",
    photoUrl: null,
    city: "Quezon City",
    isNewTrader: false,
    rating: 5,
    tradeCount: 4,
  },
  kiln: {
    id: id(2),
    handle: "kiln.and.co",
    displayName: "Kiln & Co",
    photoUrl: null,
    city: "Quezon City",
    isNewTrader: false,
    rating: 4.9,
    tradeCount: 23,
  },
  mika: {
    id: id(3),
    handle: "mika.makes",
    displayName: "Mika",
    photoUrl: null,
    city: "Pasig",
    isNewTrader: true,
    rating: null,
    tradeCount: 0,
  },
} satisfies Record<string, UserSummary>;

// GET /api/me, signed in as Storm.
export const MOCK_ME: Me = {
  ...MOCK_USERS.storm,
  bio: "Film, yarn, and whatever my friends dare me to try next.",
  hobbies: [
    { ...MOCK_HOBBIES.crochet, level: "has" },
    { ...MOCK_HOBBIES.filmPhotography, level: "has" },
    { ...MOCK_HOBBIES.pottery, level: "trying" },
  ],
  memberSince: "2026-08-02T09:00:00.000Z",
  reviewCount: 4,
  email: "storm@example.com",
  emailVerified: true,
  messagePermission: "anyone",
};

// ---------------------------------------------------------------------------
// Photos and items
// ---------------------------------------------------------------------------

function photo(n: number, width: number, height: number): Photo {
  return {
    id: id(300 + n),
    url: `https://picsum.photos/seed/trybe-${n}/${width}/${height}`,
    thumbUrl: `https://picsum.photos/seed/trybe-${n}/${Math.round(width / 4)}/${Math.round(height / 4)}`,
    width,
    height,
  };
}

const CREATED = "2026-11-01T06:00:00.000Z";

export const MOCK_ITEMS = {
  shimpoWheel: {
    id: id(401),
    ownerId: MOCK_USERS.kiln.id,
    name: "Shimpo Aspire pottery wheel",
    category: MOCK_CATEGORIES.wheelsAndKilns,
    condition: "good",
    photos: [photo(1, 1200, 1600)],
    upForTrade: true,
    lookingFor: "Film camera, or trade + PHP 1,500",
    status: "available",
    createdAt: CREATED,
    updatedAt: CREATED,
  },
  trimmingTools: {
    id: id(402),
    ownerId: MOCK_USERS.kiln.id,
    name: "Trimming tool set (8 pcs)",
    category: MOCK_CATEGORIES.handTools,
    condition: "like_new",
    photos: [photo(2, 1200, 1200)],
    upForTrade: true,
    lookingFor: "Crochet hooks or yarn",
    status: "available",
    createdAt: CREATED,
    updatedAt: CREATED,
  },
  canonAe1: {
    id: id(403),
    ownerId: MOCK_USERS.storm.id,
    name: "Canon AE-1 + 50mm",
    category: MOCK_CATEGORIES.filmCameras,
    condition: "good",
    photos: [photo(3, 1200, 1600)],
    upForTrade: true,
    lookingFor: "Pottery starter gear",
    status: "available",
    createdAt: CREATED,
    updatedAt: CREATED,
  },
  hookSet: {
    id: id(404),
    ownerId: MOCK_USERS.storm.id,
    name: "Crochet hook set (12 pcs)",
    category: MOCK_CATEGORIES.hooksAndYarn,
    condition: "like_new",
    photos: [photo(4, 1200, 1200)],
    upForTrade: true,
    lookingFor: null,
    status: "reserved",
    createdAt: CREATED,
    updatedAt: CREATED,
  },
} satisfies Record<string, Item>;

const summary = (item: Item) => ({
  id: item.id,
  name: item.name,
  condition: item.condition,
  thumbUrl: item.photos[0]?.thumbUrl ?? null,
});

// ---------------------------------------------------------------------------
// Posts
// ---------------------------------------------------------------------------

export const MOCK_POST_DETAILS = {
  mugSet: {
    id: id(501),
    title: "My first mug set off the wheel (finally centered the clay!)",
    author: MOCK_USERS.kiln,
    hobby: MOCK_HOBBIES.pottery,
    cover: photo(5, 1200, 1600),
    upForTrade: true,
    likeCount: 48,
    likedByMe: false,
    savedByMe: true,
    createdAt: "2026-11-06T04:30:00.000Z",
    caption:
      "Took 3 weekends at a community studio before these came out round. Moving to film photography now, so the wheel and my trimming tools need a new home.",
    photos: [photo(5, 1200, 1600), photo(6, 1200, 1200), photo(7, 1200, 1600)],
    items: [MOCK_ITEMS.shimpoWheel, MOCK_ITEMS.trimmingTools],
    updatedAt: "2026-11-06T04:30:00.000Z",
  },
  ae1Roll: {
    id: id(502),
    title: "First roll through the AE-1, Maginhawa street",
    author: MOCK_USERS.storm,
    hobby: MOCK_HOBBIES.filmPhotography,
    cover: photo(8, 1200, 1200),
    upForTrade: true,
    likeCount: 12,
    likedByMe: false,
    savedByMe: false,
    createdAt: "2026-11-05T10:00:00.000Z",
    caption: "Shot on Kodak Gold 200. Ready to pass the camera on and try pottery.",
    photos: [photo(8, 1200, 1200)],
    items: [MOCK_ITEMS.canonAe1],
    updatedAt: "2026-11-05T10:00:00.000Z",
  },
} satisfies Record<string, PostDetail>;

// GET /api/feed, newest first. Parsing with the card schema drops the
// detail-only fields (caption, photos, items, updatedAt).
export const MOCK_FEED: PostCard[] = Object.values(MOCK_POST_DETAILS).map((post) => postCardSchema.parse(post));

// ---------------------------------------------------------------------------
// Trades (seen as Storm)
// ---------------------------------------------------------------------------

const offerOne: TradeOffer = {
  id: id(601),
  madeBy: "me",
  myItems: [summary(MOCK_ITEMS.canonAe1)],
  theirItems: [summary(MOCK_ITEMS.shimpoWheel)],
  cash: { amount: 1500, from: "me" },
  createdAt: "2026-11-07T06:14:00.000Z",
};

const offerTwo: TradeOffer = {
  ...offerOne,
  id: id(602),
  madeBy: "them",
  cash: { amount: 1000, from: "me" },
  createdAt: "2026-11-07T06:31:00.000Z",
};

// Pending: Kiln countered, so it's Storm's turn (canRespond).
export const MOCK_TRADE_PENDING: TradeDetail = {
  id: id(701),
  status: "pending",
  other: MOCK_USERS.kiln,
  currentOffer: offerTwo,
  canRespond: true,
  updatedAt: offerTwo.createdAt,
  offers: [offerOne, offerTwo],
  meetup: { spot: null, at: null, proposedBy: null, confirmedByMe: false, confirmedByThem: false },
  completion: { confirmedByMe: false, confirmedByThem: false },
  cancelledBy: null,
  cancelReason: null,
  ratedByMe: false,
  createdAt: offerOne.createdAt,
};

const lacedOffer: TradeOffer = {
  id: id(603),
  madeBy: "them",
  myItems: [summary(MOCK_ITEMS.hookSet)],
  theirItems: [{ id: id(405), name: "Bobbin lace kit", condition: "good", thumbUrl: null }],
  cash: { amount: 200, from: "them" },
  createdAt: "2026-11-06T08:00:00.000Z",
};

// Accepted: the hook set is reserved and Mika proposed a meetup.
export const MOCK_TRADE_ACCEPTED: TradeDetail = {
  id: id(702),
  status: "accepted",
  other: MOCK_USERS.mika,
  currentOffer: lacedOffer,
  canRespond: false,
  updatedAt: "2026-11-06T09:00:00.000Z",
  offers: [lacedOffer],
  meetup: {
    spot: {
      id: id(801),
      city: "Quezon City",
      name: "UP Town Center, main entrance",
      description: "Busy, well lit, guards nearby.",
      lat: 14.6496,
      lng: 121.0756,
    },
    at: "2026-11-09T07:00:00.000Z",
    proposedBy: "them",
    confirmedByMe: false,
    confirmedByThem: true,
  },
  completion: { confirmedByMe: false, confirmedByThem: false },
  cancelledBy: null,
  cancelReason: null,
  ratedByMe: false,
  createdAt: lacedOffer.createdAt,
};

// GET /api/trades/:id/messages for the pending trade, oldest first.
export const MOCK_MESSAGES: Message[] = [
  { id: id(901), type: "offer", from: "me", offerId: offerOne.id, createdAt: offerOne.createdAt },
  {
    id: id(902),
    type: "text",
    from: "them",
    body: "Hi! An AE-1 is exactly what I was hoping for. Heads up, the splash pan has a small hairline crack.",
    asksForContact: false,
    createdAt: "2026-11-07T06:30:00.000Z",
  },
  { id: id(903), type: "offer", from: "them", offerId: offerTwo.id, createdAt: offerTwo.createdAt },
  {
    id: id(904),
    type: "text",
    from: "them",
    body: "Can u send ur number? easier to talk there",
    asksForContact: true,
    createdAt: "2026-11-07T06:32:00.000Z",
  },
  { id: id(905), type: "system", body: "Kiln & Co sent a counter offer.", createdAt: offerTwo.createdAt },
];
