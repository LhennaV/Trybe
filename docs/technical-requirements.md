# Trybe Technical Requirements Document

|              |                                                                  |
| ------------ | ---------------------------------------------------------------- |
| Version      | 0.1 (draft)                                                      |
| Last updated | 2026-10-26                                                       |
| Owners       | Tristan (backend), Lhenna (design and frontend)                  |
| Status       | Draft. Items marked **Proposed** or **Open** need team sign-off. |

## 1. Purpose

This document defines how Trybe is built: platforms, architecture, data,
APIs, security, and quality targets. It is the source of truth for technical
decisions. `AGENTS.md` is the short version for AI tools and points here.

When this document and the code disagree, fix one of them in the same pull
request.

## 2. Product summary

Trybe is a mobile-first app for trading hobby tools and equipment. Users post
what they made and tag the tools they used, browse a feed by hobby, and
propose trades on tagged items. Trades can be item for item or include a cash
or item top-up. Cash is handed over in person. Trybe never holds or sends
money and does not handle shipping.

Trust signals: ratings, trade history, account age, email verification, and a
"new trader" badge. These reduce risk. They do not guarantee safety, and the
product must never claim they do.

## 3. Goals and non-goals

### Goals for v1

- People can sign up, post gear, find gear by hobby, and complete a trade end
  to end: propose, counter, accept, meet, confirm, rate.
- Safe by default: report, block, verified email before trading, safe meetup
  guidance.
- A native mobile app (Expo) with native mobile design, published on Google
  Play (decided 2026-11-18).
- The website runs well on a phone browser and installs as a PWA.
- One API for both clients, so neither needs its own backend.

### Non-goals for v1

- In-app payments, escrow, or holding money
- Shipping or delivery
- Rentals
- Automatic item valuation
- Formal dispute resolution beyond reports and ratings

## 4. Platforms and delivery

| Platform        | How                                                       | v1     |
| --------------- | --------------------------------------------------------- | ------ |
| Android app     | Expo (React Native) in `mobile/`, built with EAS Build    | Yes    |
| iOS app         | Same Expo app, App Store                                  | **Open** |
| Mobile web      | Next.js app in the browser                                | Yes    |
| Desktop web     | Same Next.js app, responsive layout                       | Yes    |
| Installable PWA | Web manifest and service worker                           | Yes    |

Decided 2026-11-18: the store apps are native (Expo), not the PWA packaged
with PWABuilder, so they use native mobile design. App Store timing is open
(Apple Developer account, USD 99 a year).

### Mobile app requirements

- Android 8 or newer and the two latest iOS versions (when iOS ships).
- Native patterns: tab bar, stack screens with swipe back, native bottom
  sheets, pull to refresh, haptics on key actions, safe areas, keyboard
  avoidance, the phone's light or dark setting.
- Same tokens, fonts, icons, and copy as the website (`src/styles/DESIGN.md`).
- Every requirement in section 8 applies to the app unless it says web only.

### Supported browsers

Latest two versions of Chrome (Android and desktop), Safari (iOS and macOS),
Edge, and Firefox.

### Design priority

Mobile first. The phone layout is designed and built first. Tablet and
desktop are layered on top and must work properly, but they never override a
mobile decision.

## 5. Architecture

```
            Phone / Desktop browser (PWA)        Mobile app (Expo)
                          \                         /
                           \                       /
                            v                     v
                 +------------------------------------------+
                 |          Next.js app on Vercel           |
                 |                                          |
                 |  src/app/          pages (React)         |
                 |  src/app/api/      REST route handlers   |
                 |  src/server/       business logic        |
                 |  src/shared/       Zod schemas, types    |
                 +------------------------------------------+
                      |              |               |
                      v              v               v
              +-------------+  +-----------+  +-------------+
              |  Postgres   |  | Supabase  |  |  Supabase   |
              |  (Supabase) |  |   Auth    |  |   Storage   |
              +-------------+  +-----------+  +-------------+
                      |
                      v
              +-------------+
              |  Supabase   |  <--- browser subscribes to chat
              |  Realtime   |       (read only, protected by RLS)
              +-------------+

  Other services: Sentry (errors), Cloudflare Turnstile (bots),
  SMTP provider (auth emails), OpenStreetMap tiles (maps)
```

### Request flow

1. A page or component calls a REST endpoint in `src/app/api/`.
2. The route handler checks the session, validates input with a Zod schema
   from `src/shared/`, and calls a function in `src/server/`.
3. The server function applies business rules and reads or writes Postgres
   through Drizzle.
4. The route handler returns a standard JSON response (section 10).

### Architecture rules

1. Business logic lives only in `src/server/`. Route handlers stay thin.
2. All writes go through the API. The browser never writes to Supabase.
3. The browser may read chat messages directly through Supabase Realtime.
   Those tables must use Row Level Security.
4. Every input is validated with a shared Zod schema.
5. Schema changes happen only through Drizzle migrations.
6. Serverless functions connect through the Supabase connection pooler.
7. Components are server components unless they need state, events, or
   browser APIs.

## 6. Tech stack

| Area                 | Choice                                                     |
| -------------------- | ---------------------------------------------------------- |
| Runtime              | Node.js 22.13 or newer                                     |
| Package manager      | pnpm only                                                  |
| Framework            | Next.js (App Router, `src/` directory)                     |
| UI                   | React, Tailwind CSS (tokens via `@theme` in `globals.css`) |
| Language             | TypeScript, strict mode                                    |
| Database             | PostgreSQL on Supabase                                     |
| ORM and migrations   | Drizzle                                                    |
| Validation           | Zod                                                        |
| Auth                 | Supabase Auth, email and password, email verification      |
| Auth emails          | Custom SMTP provider (for example Resend)                  |
| File storage         | Supabase Storage                                           |
| Realtime chat        | Supabase Realtime                                          |
| Maps                 | Leaflet with OpenStreetMap tiles (website)                 |
| Bot protection       | Cloudflare Turnstile                                       |
| Error tracking       | Sentry                                                     |
| Hosting              | Vercel                                                     |

### Mobile app (`mobile/`)

| Area                 | Choice                                                         |
| -------------------- | -------------------------------------------------------------- |
| Framework            | Expo (React Native), Expo Router                               |
| Language             | TypeScript, strict mode                                        |
| Styling              | NativeWind, same tokens as `DESIGN.md`                         |
| Icons and fonts      | `phosphor-react-native`, `@expo-google-fonts` (Lilita One, Nunito) |
| API data             | TanStack Query with `apiRequest` and Zod contracts from `src/shared/` |
| Session              | `expo-secure-store`, Bearer token                              |
| Realtime chat        | `@supabase/supabase-js` Realtime (read only, RLS)              |
| Photos               | `expo-image`, `expo-image-picker`, `expo-image-manipulator`    |
| Maps                 | `react-native-maps` (works in Expo Go; Apple Maps on iOS)      |
| Push                 | `expo-notifications`                                           |
| Errors               | `@sentry/react-native`                                         |
| Builds and releases  | EAS Build, EAS Submit, EAS Update                              |
| Tests                | Jest, React Native Testing Library, Maestro                    |
| Repo                 | pnpm workspaces: the web app at the root, the app in `mobile/` |

Testing on a phone: Expo Go (free, Android and iPhone) while the app only uses
Expo Go libraries. A development build is free on Android; on an iPhone it
needs the paid Apple Developer account when building from Windows.

Adding a framework, database, auth provider, or paid service requires team
agreement and an update to this table.

## 7. Repository structure and ownership

```
trybe/
├── .github/CODEOWNERS
├── docs/                       technical docs (this file)
├── src/
│   ├── app/                    pages and layouts          Lhenna
│   │   └── api/                REST route handlers        Tristan
│   ├── components/             UI components              Lhenna
│   ├── styles/                 extra styles               Lhenna
│   ├── server/                 business logic             Tristan
│   │   ├── auth/
│   │   ├── db/                 Drizzle schema, migrations
│   │   ├── items/
│   │   └── trades/
│   └── shared/                 Zod schemas, types         Both
├── mobile/                     Expo app (Android, iOS)    Lhenna
├── tests/                      backend tests              Tristan
├── AGENTS.md
└── README.md
```

Changes to `src/shared/` need agreement from both owners because they change
the contract between frontend and backend.

## 8. Functional requirements

IDs are used in issues and pull requests. **P0** is required for launch,
**P1** is wanted for launch, **P2** can follow.

### 8.1 Accounts and auth

| ID      | Requirement                                                                       | Priority |
| ------- | --------------------------------------------------------------------------------- | -------- |
| AUTH-01 | Sign up with display name, handle, email, password                                | P0       |
| AUTH-02 | Turnstile check on sign up and log in                                             | P0       |
| AUTH-03 | Accept Terms and Community Guidelines during sign up                              | P0       |
| AUTH-04 | Confirm minimum age during sign up (age **Open**)                                 | P0       |
| AUTH-05 | Email verification. Unverified users can browse but cannot post or propose trades | P0       |
| AUTH-06 | Log in, log out, reset password                                                   | P0       |
| AUTH-07 | Change email and password from settings                                           | P1       |
| AUTH-08 | Google sign in                                                                    | P2       |

### 8.2 Profiles and onboarding

| ID      | Requirement                                                                        | Priority |
| ------- | ---------------------------------------------------------------------------------- | -------- |
| PROF-01 | Onboarding: pick hobbies you have and hobbies you want to try                      | P0       |
| PROF-02 | Profile shows name, handle, city, bio, hobbies, rating, trade count, time on Trybe | P0       |
| PROF-03 | Profile tabs: posts, items for trade, trade history, reviews                       | P0       |
| PROF-04 | "New trader" badge derived from account age and completed trades                   | P0       |
| PROF-05 | Location stored and shown as city only                                             | P0       |
| PROF-06 | Edit profile and photo                                                             | P0       |
| PROF-07 | Report count is never shown publicly                                               | P0       |
| PROF-08 | Follow users (**Open**)                                                            | P2       |

### 8.3 Items (gear)

| ID      | Requirement                                                 | Priority |
| ------- | ----------------------------------------------------------- | -------- |
| ITEM-01 | Add an item with photo, name, category, condition           | P0       |
| ITEM-02 | Mark an item up for trade, with optional "looking for" text | P0       |
| ITEM-03 | Item status: available, reserved, traded                    | P0       |
| ITEM-04 | Reserved and traded items cannot be offered in new trades   | P0       |
| ITEM-05 | Edit or remove an item that is not in an accepted trade     | P0       |

### 8.4 Posts and feed

| ID      | Requirement                                                                | Priority |
| ------- | -------------------------------------------------------------------------- | -------- |
| POST-01 | Create a post with up to 6 photos, title, caption, one hobby, tagged items | P0       |
| POST-02 | A post is "for trade" if any tagged item is up for trade. No manual toggle | P0       |
| POST-03 | Feed cards show an "Up for trade" badge on for-trade posts                 | P0       |
| POST-04 | "Propose a trade" appears only on for-trade posts                          | P0       |
| POST-05 | Feed filtered by hobby chips, with cursor pagination                       | P0       |
| POST-06 | Like a post                                                                | P1       |
| POST-07 | Save a post                                                                | P1       |
| POST-08 | Saved boards (**Open**)                                                    | P2       |
| POST-09 | Edit and delete own posts                                                  | P0       |

### 8.5 Explore and search

| ID     | Requirement                                  | Priority |
| ------ | -------------------------------------------- | -------- |
| EXP-01 | Browse hobbies with counts of available gear | P1       |
| EXP-02 | Search posts, items, and people by keyword   | P1       |
| EXP-03 | "Near you" results based on the same city    | P1       |
| EXP-04 | "Wanted near you" posts (**Open**)           | P2       |

### 8.6 Trades

| ID     | Requirement                                                                              | Priority |
| ------ | ---------------------------------------------------------------------------------------- | -------- |
| TRD-01 | Propose a trade: pick one or more of their for-trade items and one or more of your items. Cash is only a top-up, never the whole offer | P0       |
| TRD-02 | Optional balance: cash amount with direction (from you or from them), or extra items     | P0       |
| TRD-03 | Counter offer creates a new offer row on the same trade                                  | P0       |
| TRD-04 | Only the person who did not make the current offer can accept, decline, or counter       | P0       |
| TRD-05 | The person who made the current offer sees a waiting state                               | P0       |
| TRD-06 | Accepting reserves all items in the offer and cancels other pending trades that use them | P0       |
| TRD-07 | Offer history visible in the trade chat                                                  | P0       |
| TRD-08 | Either side can cancel before completion                                                 | P0       |
| TRD-09 | Proposing requires a verified email                                                      | P0       |
| TRD-10 | Empty state when the proposer has no items, with a link to add one (they can't propose until they add one) | P0       |

### 8.7 Chat and message requests

| ID      | Requirement                                                          | Priority |
| ------- | -------------------------------------------------------------------- | -------- |
| CHAT-01 | Each trade has a chat thread with text messages and offer cards      | P0       |
| CHAT-02 | First contact from someone you have not traded with goes to Requests | P0       |
| CHAT-03 | Request actions are labeled "Reply" or "Accept chat", not "Accept"   | P0       |
| CHAT-04 | Warn when a message asks for phone numbers or outside messaging apps | P1       |
| CHAT-05 | Messages update in real time                                         | P0       |
| CHAT-06 | Settings: who can message me                                         | P1       |

### 8.8 Meetup, completion, and ratings

| ID      | Requirement                                                                                 | Priority |
| ------- | ------------------------------------------------------------------------------------------- | -------- |
| MEET-01 | After acceptance, one side proposes a spot and time, the other confirms or suggests another | P0       |
| MEET-02 | Suggested safe spots come from a curated list per city                                      | P1       |
| MEET-03 | Map shows the selected spot                                                                 | P1       |
| MEET-04 | "Before you swap" checklist shown before the meetup (not stored)                            | P0       |
| MEET-05 | Trade is completed only when both sides confirm the handoff                                 | P0       |
| MEET-06 | "They didn't show up" cancels the trade, frees the items, and files a report                | P0       |
| RATE-01 | Each person rates the other once per completed trade: stars, tags, note                     | P0       |
| RATE-02 | Ratings stay hidden until both have rated or 7 days pass                                    | P0       |
| RATE-03 | Reviews can be reported                                                                     | P0       |

### 8.9 Safety and moderation

| ID      | Requirement                                                              | Priority |
| ------- | ------------------------------------------------------------------------ | -------- |
| SAFE-01 | Report users, posts, trades, reviews, and messages, with a reason        | P0       |
| SAFE-02 | Block a user: they cannot message you, see your posts, or propose trades | P0       |
| SAFE-03 | Mute a user's posts from your feed                                       | P1       |
| SAFE-04 | Admin review queue for reports (simple internal page is enough)          | P0       |
| SAFE-05 | Admin can hide content and suspend accounts                              | P0       |
| SAFE-06 | Safety tips page and "Trade safely" card                                 | P0       |
| SAFE-07 | Community Guidelines page defines banned content and behavior            | P0       |

### 8.10 Notifications

| ID       | Requirement                                                                        | Priority |
| -------- | ---------------------------------------------------------------------------------- | -------- |
| NOTIF-01 | In-app notifications for offers, counters, acceptances, messages, meetups, ratings | P0       |
| NOTIF-02 | Push for the same events: Expo push in the app, web push on the website            | P1       |
| NOTIF-03 | Notification settings toggles                                                      | P1       |
| NOTIF-04 | Weekly email digest (**Open**)                                                     | P2       |

### 8.11 Account deletion and settings

| ID     | Requirement                                                                                                             | Priority |
| ------ | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| DEL-01 | Delete account from settings, with a confirmation screen                                                                | P0       |
| DEL-02 | Public web page to request deletion without the app                                                                     | P0       |
| DEL-03 | Deletion removes the user's data. Active trades are cancelled first. Kept data, if any, is listed in the privacy policy | P0       |
| SET-01 | Settings: profile, email, password, privacy, notifications, guidelines, terms, log out, delete                          | P0       |
| SET-02 | Dark mode (**Open**)                                                                                                    | P2       |

## 9. Data model

Draft. All tables have `id` (uuid), `created_at`, and `updated_at` unless
noted.

| Table             | Key columns                                                                                                                                                                                                                      | Notes                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| users             | email, display_name, handle (unique), photo_url, bio, city, age_confirmed_at, email_verified, message_permission, terms_accepted_at, suspended_at                                                                                | `is_new_trader` is derived, not stored   |
| hobbies           | name, slug                                                                                                                                                                                                                       | Seeded list                              |
| user_hobbies      | user_id, hobby_id, level (has, trying)                                                                                                                                                                                           | Unique (user_id, hobby_id)               |
| categories        | hobby_id, name, slug, position | Seeded per hobby, "Other" last (2026-11-13). Example: Wheels & kilns under Pottery |
| photos            | owner_id, path, thumb_path, width, height | Uploaded first, attached by id. Only storage paths are stored; URLs are built from NEXT_PUBLIC_SUPABASE_URL (2026-11-13) |
| items             | owner_id, name, category_id, condition (like_new, good, fair, worn), up_for_trade, looking_for, status (available, reserved, traded)                                                                                             |                                          |
| item_photos       | item_id, photo_id, position | Up to 4, a photo belongs to one item |
| posts             | user_id, hobby_id, title, caption, hidden_at | One hobby per post (2026-11-08). For-trade flag derived from tagged items |
| post_photos       | post_id, photo_id, position | Max 6 per post, a photo belongs to one post |
| post_items        | post_id, item_id                                                                                                                                                                                                                 | Many to many                             |
| post_hobbies      | Replaced by `posts.hobby_id` (2026-11-13) | Not built |
| likes             | user_id, post_id                                                                                                                                                                                                                 | Unique pair                              |
| saves             | user_id, post_id                                                                                                                                                                                                                 | Unique pair                              |
| trades            | initiator_id, recipient_id, status, current_offer_id, cancelled_by, cancel_reason. Meetup and completion columns come with Phase 4 | Row is locked on every change. A deleted account's id becomes null; the trade stays for the other person (2026-11-17) |
| trade_offers      | trade_id, made_by, cash_amount, cash_from (initiator, recipient, none)                                                                                                                                                           | One row per offer or counter             |
| trade_offer_items | offer_id, item_id, item_name, side (initiator, recipient) | item_name is a copy taken when the offer is made; item_id becomes null if the item is deleted (2026-11-17) |
| messages          | trade_id, sender_id, type (text, offer, system), body, offer_id                                                                                                                                                                  | RLS: only the two trade members can read |
| meetup_spots      | city, name, description, lat, lng, active                                                                                                                                                                                        | Curated list                             |
| ratings           | trade_id, rater_id, ratee_id, score (1 to 5), tags, note, visible_at                                                                                                                                                             | Unique (trade_id, rater_id)              |
| reports           | reporter_id, target_type, target_id, reason, details, status, resolved_by                                                                                                                                                        | Never shown publicly                     |
| blocks            | blocker_id, blocked_id                                                                                                                                                                                                           | Unique pair                              |
| mutes             | muter_id, muted_id                                                                                                                                                                                                               | Unique pair                              |
| notifications     | user_id, type, payload, read_at                                                                                                                                                                                                  |                                          |

### Key indexes

- posts by `created_at` for the feed, plus `post_hobbies (hobby_id)`
- items by `(owner_id, status)`
- trades by `initiator_id`, `recipient_id`, and `status`
- messages by `(trade_id, created_at)`
- users by `handle` and `city`

## 10. API

### Style

REST over JSON, implemented as Next.js route handlers in `src/app/api/`.
Trade state changes use action endpoints instead of a generic update.

### Response shape

Success:

```json
{ "data": {} }
```

Error:

```json
{
  "error": {
    "code": "TRADE_NOT_PENDING",
    "message": "This trade was already accepted."
  }
}
```

`code` is stable and used by the frontend. `message` is safe to show users.

### Status codes

| Code     | Use                                                              |
| -------- | ---------------------------------------------------------------- |
| 200, 201 | Success, created                                                 |
| 400      | Validation failed                                                |
| 401      | Not logged in                                                    |
| 403      | Logged in but not allowed                                        |
| 404      | Not found                                                        |
| 409      | State conflict, for example the trade changed during the request |
| 429      | Rate limited                                                     |
| 500      | Unexpected error (also sent to Sentry)                           |

### Auth

Session comes from Supabase Auth. The website uses cookies. The mobile app
sends `Authorization: Bearer <token>`. The API accepts both.

Mobile log in and sign up (**Decided 2026-11-21**, Tristan):

- Sign up is the same `POST /api/auth/signup`; it returns no session, since
  the email must be verified first.
- The app logs in with `POST /api/auth/token`: the same body as
  `/api/auth/login`, answered with `{ user, session: { accessToken,
  refreshToken, expiresAt } }` and no cookies (`authSessionSchema` in
  `src/shared/contracts/auth.ts`).
- `POST /api/auth/logout` with the Bearer token ends that session; its
  refresh token stops working.
- The app stores the tokens in `expo-secure-store` and hands them to
  `supabase.auth.setSession()`, which refreshes them and powers Realtime.
- Turnstile still runs: the app shows the widget from a small page on our
  site (`/captcha`) in a WebView and sends the token like the website does.
  Lhenna builds the page (decided 2026-11-21).

### Pagination

Cursor based: `?cursor=<opaque>&limit=20`. Responses include `nextCursor` or
`null`.

### Endpoints (draft)

```
Auth
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout                  cookies (website) or Bearer (app)
POST   /api/auth/token                   app log in: returns the session instead of cookies
POST   /api/auth/password/forgot
POST   /api/auth/password
POST   /api/auth/verify/resend
GET    /api/auth/confirm?token_hash=&type=    link in Supabase emails

Feed and posts
GET    /api/feed?hobby=&cursor=
GET    /api/posts/:id
POST   /api/posts
PATCH  /api/posts/:id
DELETE /api/posts/:id
POST   /api/posts/:id/like
DELETE /api/posts/:id/like
POST   /api/posts/:id/save
DELETE /api/posts/:id/save

Items
GET    /api/categories?hobby=              categories of a hobby, Other last
POST   /api/photos                          upload a photo, then attach it by id
GET    /api/me/items?status=&cursor=
POST   /api/items
PATCH  /api/items/:id
DELETE /api/items/:id

Users
GET    /api/users/:handle
POST   /api/me/photo                        profile photo
DELETE /api/me/photo
GET    /api/users/:handle/posts?cursor=      profile posts tab
GET    /api/users/:handle/items?cursor=      profile gear tab: up for trade and available only
GET    /api/users/:handle/reviews?cursor=   reviews tab: shown ratings only (RATE-02), newest first
GET    /api/me
PATCH  /api/me
DELETE /api/me

Trades
POST   /api/trades                   propose; the other person owns wantItemIds. Returns the trade (201)
GET    /api/trades?status=&cursor=   my trades, most recently changed first
GET    /api/trades/:id               404 for anyone not in the trade
POST   /api/trades/:id/counter
POST   /api/trades/:id/accept
POST   /api/trades/:id/decline
POST   /api/trades/:id/cancel        reason withdrawn or no_show (no_show only after accepting)
POST   /api/trades/:id/meetup          suggest a spot and time (accepted trades); replaces the last one
POST   /api/trades/:id/meetup/confirm  the other person agrees
POST   /api/trades/:id/complete      confirm my side of the handoff; completes when both have
POST   /api/trades/:id/ratings
GET    /api/conversations?box=chats|requests&cursor=   direct messages outside trades (CHAT-02)
POST   /api/conversations                          message someone by handle; a request if you haven't traded
GET    /api/conversations/:id/messages?cursor=
POST   /api/conversations/:id/messages             replying to a request accepts it
POST   /api/conversations/:id/accept
POST   /api/conversations/:id/decline              silent; they can ask again after 7 days
GET    /api/trades/:id/messages?cursor=
POST   /api/trades/:id/messages

Safety
POST   /api/reports
POST   /api/blocks
DELETE /api/blocks/:userId
POST   /api/mutes
DELETE /api/mutes/:userId

Other
GET    /api/hobbies
GET    /api/meetup-spots?city=            public; active spots, city in any case
GET    /api/notifications
POST   /api/notifications/read
GET    /api/search?q=
```

## 11. Trade state machine

### States

| State     | Meaning                                              |
| --------- | ---------------------------------------------------- |
| pending   | An offer is waiting for a response                   |
| accepted  | Both agreed. Items are reserved. Meetup is being set |
| completed | Both confirmed the handoff                           |
| declined  | The current offer was declined                       |
| cancelled | Withdrawn or a no-show, before completion            |

### Transitions

| From     | Action            | To        | Who                                       | Effects                                               |
| -------- | ----------------- | --------- | ----------------------------------------- | ----------------------------------------------------- |
| none     | propose           | pending   | Initiator                                 | Create trade and first offer                          |
| pending  | counter           | pending   | Person who did not make the current offer | New offer row, `current_offer_id` updated             |
| pending  | accept            | accepted  | Person who did not make the current offer | Reserve items, cancel other pending trades using them |
| pending  | decline           | declined  | Person who did not make the current offer | None                                                  |
| pending  | cancel            | cancelled | Either                                    | None                                                  |
| accepted | confirm complete  | completed | Both must confirm                         | Items become traded, rating window opens              |
| accepted | cancel or no-show | cancelled | Either                                    | Items back to available. No-show files a report       |

### Concurrency

Every action runs in one database transaction:

1. `SELECT ... FOR UPDATE` on the trade row.
2. Re-check the status and who is allowed to act.
3. For accept, also lock the item rows and check they are still available.
4. Apply changes and commit.

If a check fails because something changed, return `409`.

### Required tests

- Each allowed transition
- Each forbidden transition, including the offer maker trying to accept
- Two simultaneous accepts or accept and counter on the same trade
- Accepting a trade whose item was reserved by another trade
- Completion requires both confirmations

## 12. Realtime chat

- The browser subscribes to new rows in `messages` for one trade.
- RLS policy: a user can read messages only if they are the initiator or
  recipient of that trade and neither has blocked the other.
- Sending a message always goes through `POST /api/trades/:id/messages` so
  validation, block checks, and the contact info warning run on the server.
- Built 2026-11-22: `messages` is in the `supabase_realtime` publication. A
  signed-in client subscribes to INSERT on `messages` filtered by
  `trade_id=eq.<id>` and loads older messages from
  `GET /api/trades/:id/messages` (newest first). The chat is read only once
  the trade is completed, declined, or cancelled.

## 13. Files and images

| Rule            | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Allowed types   | JPEG, PNG, WebP, HEIC. The browser converts HEIC to JPEG (decided 2026-11-11) |
| Max upload size | 10 MB per picked photo (**Proposed**). The browser shrinks it to 1600px first, so the API takes at most 4 MB (Vercel refuses requests over 4.5 MB) |
| Photos per post | Up to 6                                                               |
| Photos per item | Up to 4 (**Proposed**)                                                |
| Stored sizes    | Resized on upload (for example 400px thumbnail and 1600px full), WebP |
| Metadata        | Strip all EXIF data, including GPS location, before storing           |
| Access          | Public read for post and item photos, write only through the API      |
| Where           | Supabase Storage bucket `photos` (migration 0006). URLs are built from `NEXT_PUBLIC_SUPABASE_URL`, never hard-coded |
| How             | `resizeForUpload()` in the browser, then `processImage()` on the server: checks the real file type from the bytes, turns it upright, drops EXIF and GPS, writes WebP |

## 14. Security requirements

- Passwords and sessions handled only by Supabase Auth.
- Supabase service role key is server only. Never in client code, never
  committed.
- Secrets in `.env.local` and Vercel environment variables only.
- RLS enabled on every table. Tables the browser does not read have no
  public policies.
- Every API input validated with Zod. Unknown fields rejected.
- Authorization checked in `src/server/` for every action, not only in the UI.
- Rate limits on sign up, log in, posting, proposing trades, messaging, and
  reporting.
- Turnstile on sign up and log in.
- User text is rendered as text, never as raw HTML.
- Cookies are HttpOnly, Secure, and SameSite.
- Blocked users are filtered out of feed, search, chat, and trades on the
  server.
- Dependencies updated regularly. Review `pnpm audit` before release.
- Rate limits apply to every API route, not only the actions above: a default
  limit per user (or per IP when logged out) and tighter ones on those actions.
  The count must be shared by all serverless instances, so it needs a store
  (a Postgres table or Upstash Redis free tier, **open decision**, see section 21).
- Data integrity: rules that must always hold live in the database as checks,
  foreign keys, and unique constraints, not only in Zod. Changes that touch
  more than one row run in one transaction.
- Cross-API checks: never trust ids sent by the client. Each endpoint re-checks
  that every id it receives exists, belongs to the right person, and is in the
  right state (for example, an offered item is the offerer's and still
  available), even if another endpoint checked it earlier.
- Input: Zod trims and limits every field. Text is stored as typed and shown
  as text, so no HTML sanitizing is needed unless rich text is ever added.
- Audit trail on all main tables (docs/database.md section 7).
- Reference id: every error response and Sentry event carries a request id
  (**Proposed**), so a user's bug report can be matched to the logs.

## 15. Privacy and compliance

### Google Play

- User generated content policy: terms acceptance before posting, defined
  banned content, in-app report and block, active moderation.
- Account deletion in the app and on a web page, linked in the Data safety
  form.
- Accurate Data safety form and content rating questionnaire.
- Privacy policy URL in the store listing.
- New personal developer accounts need a closed test with at least 12
  testers for 14 days before production. Plan for this.

### Philippines Data Privacy Act

- Privacy notice in plain language: what we collect, why, how long, and
  user rights.
- Collect only what is needed. Location is city only.
- Check National Privacy Commission registration rules as the user base
  grows. Confirm the current thresholds with the NPC.
- Have a basic data breach response plan.

### Legal pages and consent

| Item | What Trybe needs | Status |
| --- | --- | --- |
| Privacy policy | Required by Google Play and the Data Privacy Act. Lists the data we collect, why, how long we keep it (docs/database.md section 9), and every third party below | ⏳ Phase 5 (SAFE-07) |
| Terms of Service, Community Guidelines | Accepted before posting. The acceptance time is stored (`users.terms_accepted_at`) | Stored ✅, final text ⏳ Phase 5 |
| Form consent | Sign up asks for Terms and age with a checkbox that is not pre-ticked. If the Terms change, ask again and store the new time | Sign up ✅, re-asking ⏳ |
| Cookies and consent banner | v1 uses only essential cookies (login session, Turnstile) and no analytics or ad tracking, so no consent banner is needed. List the cookies in the privacy policy. Adding analytics or tracking later means checking consent first | Re-check before adding analytics |
| Third parties | Cloudflare Turnstile, Sentry (no session replay, no personal data in events), OpenStreetMap tiles (the viewer's IP goes to the tile server; follow the OSM tile policy and show attribution), Supabase, Vercel, the SMTP provider. Name each in the privacy policy | ⏳ Phase 5 |
| Refund policy | Not needed: Trybe never takes or holds money. The Terms say cash is between the two traders and Trybe cannot refund it. Revisit if v2 boosts or Trybe Plus happen (Google Play refund rules) | Terms text ⏳ |
| Data deletion request | In the app and on a public web page (DEL-01 to DEL-03) | ⏳ Phase 5 |
| Local laws | Data Privacy Act (above). Check whether the Internet Transactions Act (RA 11967) or the Consumer Act applies to a free, non-commercial trading app before launch | ⏳ before launch |

### Data we collect

Email, display name, handle, profile photo, bio, city, hobbies, posts and
photos, items, trades, messages, ratings, reports, and basic device and error
data through Sentry. No payment data, no exact location, no contacts.

## 16. Non-functional requirements

| Area          | Target                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| Performance   | Feed first load under 2.5 s Largest Contentful Paint on a mid-range Android phone on 4G (**Proposed**)       |
| API speed     | Most API calls under 300 ms at the server (**Proposed**)                                                     |
| Accessibility | WCAG 2.1 AA contrast, 44px minimum tap targets, no hover-only actions, labels on all inputs and icon buttons |
| Accessibility (more) | Alt text on every image (photos use the post or item name), every action reachable by keyboard with a visible focus ring, forms submit with Enter and show errors next to the field, icon buttons have labels |
| Licenses      | Fonts (Lilita One, Nunito) are SIL Open Font License, free to use. Every icon set and image we did not make needs a license we can show; keep the list in the repo |
| Speed         | Photos shrunk and stored as WebP; images below the fold lazy load (`next/image`); skeletons while loading; search input debounced (about 300 ms); lists always paginated and queries select only needed columns. Vercel already gives a CDN, compression, and load balancing. Cache public data with Next.js caching first; add Redis only if measured slowness needs it (paid service, ask first) |
| Reliability   | Supabase Pro daily backups enabled before launch                                                             |
| Observability | Sentry on client and server, alerts for new errors                                                           |
| PWA           | Installable, offline page shown when there is no connection                                                  |
| SEO           | Public posts and profiles have unique titles and descriptions, sitemap, robots.txt                           |
| Localization  | English UI for v1. PHP currency formatting                                                                   |
| Time zone     | Store times in UTC, show in the user's local time                                                            |

## 17. Environments and deployment

| Environment | Where                           | Database                    |
| ----------- | ------------------------------- | --------------------------- |
| Local       | `pnpm dev`                      | Supabase dev project        |
| Preview     | Vercel preview per pull request | Supabase dev project        |
| Production  | Vercel production from `main`   | Supabase production project |

### Environment variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          server only
DATABASE_URL                       pooled connection
DIRECT_DATABASE_URL                for migrations
TURNSTILE_SECRET_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN
SENTRY_ORG                         build only, source map upload
SENTRY_PROJECT                     build only, source map upload
SENTRY_AUTH_TOKEN                  build only, source map upload
```

### Pull request checks

Lint, type check, tests, and build must pass before merging into `main`.

### Migrations

Generated with Drizzle, reviewed in the pull request, applied to the dev
project first, then to production during release.

## 18. Testing

| Layer       | What                                               | Tool                          |
| ----------- | -------------------------------------------------- | ----------------------------- |
| Unit        | Trade state machine, validation, permission checks | Vitest                        |
| Integration | API endpoints against a test database              | Vitest                        |
| End to end  | Sign up, post, propose, accept, complete, rate     | Playwright, P1                |
| Performance | Busiest endpoints under load                       | k6                            |
| Manual      | Real Android phone and iPhone before each release  | Checklist                     |

Trade logic must have tests before its endpoints are merged.

## 19. Git workflow

- One working branch per person: Lhenna on `frontend`, Tristan on `backend` (AGENTS.md).
- Pull request into `main`. CODEOWNERS assigns the reviewer.
- No direct pushes to `main`. Merge only when CI is green; a merge deploys to production.
- Link the requirement ID in the pull request when there is one
  (for example "TRD-06").

## 20. Costs at launch

| Item                          | Cost                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| Supabase Pro                  | USD 25 per month                                                            |
| Vercel                        | Free while non-commercial. USD 20 per user per month once Trybe earns money |
| Google Play developer account | About USD 25, one time                                                      |
| Domain                        | Yearly, depends on registrar                                                |
| SMTP provider                 | Free tier likely enough at first                                            |
| Sentry                        | Free tier likely enough at first                                            |
| Expo EAS                      | Free plan has a monthly build limit; `eas build --local` builds for free    |
| Apple Developer (App Store)   | USD 99 per year, only when iOS ships (**Open**)                             |

Check current pricing before paying. Prices change.

## 21. Open decisions

| Topic                            | Options                             | Owner   |
| -------------------------------- | ----------------------------------- | ------- |
| Store apps                       | **Decided 2026-11-18:** native Expo app in `mobile/`, not the PWA packaged with PWABuilder. The Next.js app stays as the website | Both    |
| App Store at launch              | At launch or after (Apple Developer account, USD 99 a year) | Both    |
| Mobile log in and bot check      | **Decided 2026-11-21:** `POST /api/auth/token` returns the session for the app; Turnstile from a `/captcha` page in a WebView, built by Lhenna (section 10, Auth) | Tristan |
| Minimum age                      | 18+ or another age                  | Both    |
| Followers                        | v1 or later                         | Both    |
| Saved boards                     | Boards or simple save               | Both    |
| "Wanted" posts                   | v1 or later                         | Both    |
| "Replies in ~1 hr"               | Keep or cut                         | Both    |
| Dark mode                        | v1 or later                         | Lhenna  |
| Weekly email digest              | v1 or later                         | Both    |
| Running costs (domain)           | **Decided 2026-11-17:** Tristan and Lhenna split the domain (about PHP 600 to 900 a year). Trybe stays non-commercial, so the free Vercel Hobby plan still applies | Both    |
| Earning money (v2 plan)          | **Planned 2026-11-17, not built:** after launch, maybe listing boosts (PHP 20 to 50) and Trybe Plus (about PHP 99 a month, wishlist alerts), with posting, chat, trades, and safety always free. Before building: in-app payments are "Not in v1" (AGENTS.md); Vercel needs a paid plan once Trybe earns (section 20); Play Store digital goods usually need Google Play Billing. Check current terms first | Both    |
| "Founding Paw" badge            | **Decided 2026-11-17:** on the About page only, for Tristan and Lhenna. Not stored on accounts, and never shown as a trust or verification badge | Both    |
| "New trader" badge               | **Decided 2026-11-10:** stays until the account is 30 days old and has 3 completed trades | Both    |
| "Other" hobby in onboarding      | **Decided 2026-11-10:** saved as a hobby request, not shown on the profile; popular ones are added to the list | Both    |
| Branch protection on `main`      | **Decided 2026-11-10:** off. Merge only when CI is green (docs/testing.md section 10) | Both    |
| Post and trade details           | **Decided 2026-11-08:** one hobby per post; offers need an item on both sides (no cash-only); fixed rating tags (`RATING_TAGS` in `src/shared/contracts/trades.ts`); item condition "worn" shows as "Well loved" | Both    |
| Message requests (CHAT-02)       | **Decided 2026-11-23 (Tristan and Lhenna), built the same day:** people can message without a trade, one conversation per pair (new `conversations` table; trade chats stay inside trades). Someone you have no completed trade with lands in Requests and can send one message until you "Accept chat". "Traded only" refuses messages from them (403) but still allows trade proposals. Decline is silent; they can ask again after 7 days (block to stop for good, Phase 5). Trade proposals always go to Trades, not Requests | Both    |
| Who can message by default       | **Decided 2026-11-05:** anyone via Requests (`message_permission` default `anyone`); users can switch to traded-only | Both    |
| Rate limit store                 | Postgres table or Upstash Redis (free tier). Decide in Phase 5 | Tristan |
| Item photo limit and upload size | See section 13                      | Tristan |
| End-to-end test tool             | **Decided 2026-11-09:** Playwright for E2E, k6 for performance, Supabase local stack for the test database (see docs/testing.md) | Tristan |

## 22. Revision history

| Version | Date       | Change      |
| ------- | ---------- | ----------- |
| 0.1     | 2026-10-26 | First draft |
