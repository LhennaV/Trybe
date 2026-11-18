# Trybe Implementation Plan

|              |                                       |
| ------------ | ------------------------------------- |
| Version      | 0.1                                   |
| Last updated | 2026-10-26                            |
| Based on     | `docs/technical-requirements.md` v0.1 |

This plan says what to build and in what order. The technical requirements
document says how each part must work. Requirement IDs like `TRD-06` point
to that document.

## How to use this plan

- Work through phases in order. Inside a phase, backend and frontend tasks
  can run at the same time unless a dependency says otherwise.
- Tick a task only when it is merged into `main`.
- Put the task's requirement IDs in the pull request title or description.
- Update the progress table when a phase is done, and release a new version
  (README, "Versions and releases"): Phase 1 is `0.2.0`, Phase 2 `0.3.0`, and
  so on. The Play Store launch is `1.0.0`.
- Add a line to CHANGELOG.md under "Unreleased" in each pull request that
  changes what people see.
- Phase targets are rough. Move them when school gets busy, and write down
  the new target instead of skipping work.

Tags: **[BE]** Tristan, **[FE]** Lhenna, **[Both]** together.

## Progress

| Phase | Name                              | Target | Status      |
| ----- | --------------------------------- | ------ | ----------- |
| 0     | Foundation                        | TBD    | Done        |
| 1     | Accounts and profiles             | TBD    | Done        |
| 2     | Items, posts, and feed            | TBD    | In progress |
| 3     | Trades core                       | TBD    | In progress |
| 4     | Chat, meetup, completion, ratings | TBD    | In progress |
| 5     | Safety and compliance             | TBD    | In progress |
| 6     | Explore, PWA, and polish          | TBD    | In progress |
| M     | Mobile app (Expo)                 | TBD    | Not started |
| 7     | Play Store launch                 | TBD    | Not started |

## Timeline shape

```
Phase 0 → 1 → 2 → 3 → 4 → 5 ──→ 6 ─────────────→ 7
                 └─ M: mobile app, built screen by screen ─┘
                              └─ Play Store closed test runs here (14+ days)
```

Decided 2026-11-18: the store app is a native Expo app (Phase M), not the PWA
packaged with PWABuilder. The website keeps going through Phases 2 to 6.
Phase M builds each app screen once its API exists, so it runs alongside them.
The closed test starts when Phase 5 and the app's Phase M screens for those
phases are done.

The Google Play closed test needs at least 12 testers for 14 days in a row.
Build Phase 6 while it runs, so the 14 days are not wasted waiting.

## Decisions needed before each phase

| Before phase | Decision                                           | See            |
| ------------ | -------------------------------------------------- | -------------- |
| 1            | Minimum user age                                   | TRD section 21 |
| 1            | Default "who can message me"                       | TRD section 21 |
| 2            | Item photo limit and max upload size               | TRD section 13 |
| 2            | Saved boards or simple save                        | TRD section 21 |
| 6            | Followers, "Wanted" posts, dark mode, email digest | TRD section 21 |
| M            | Mobile log in (tokens) and bot check               | TRD section 10 |
| 7            | App Store at launch or after                       | TRD section 21 |

---

## Phase 0: Foundation

Goal: both of you can run the app, see real design tokens, and work from
shared contracts and mock data without blocking each other.

### Tasks

- [x] **[BE]** Next.js app in repo root, `src/` structure, CODEOWNERS
- [x] **[BE]** Add `AGENTS.md`, `docs/technical-requirements.md`, this plan
- [x] **[BE]** Update `README.md`: stack, setup steps, pnpm only, branch rules
- [x] **[BE]** Create Supabase dev project
- [x] **[BE]** Set up Drizzle, database connection (pooled and direct), first empty migration
- [x] **[BE]** `.env.example` with every variable from TRD section 17
- [x] **[BE]** Deploy to Vercel, preview deploys on pull requests
  - Live 2026-11-08 at https://trybe-puce.vercel.app (Vercel team "trybeappteam", Hobby plan,
    GitHub connected through LhennaV). Uses the dev Supabase project until a production one exists.
    Preview deploys come with the next pull request; check that one gets a link.
- [x] **[BE]** Pull request checks: lint, type check, test, build
- [x] **[BE]** Set up Vitest with one passing test
- [x] **[BE]** Set up Sentry (client and server)
- [x] **[BE]** `src/shared/contracts/common.ts`: response shape, error codes, pagination
- [x] **[Both]** Draft contracts for users, items, posts, trades in `src/shared/contracts/`
  - Drafted 2026-11-08: `items.ts`, `posts.ts`, `trades.ts`, `photos.ts` (users and hobbies
    were done in Phase 1). Decided by Tristan 2026-11-08 (TRD section 21): one hobby per post,
    no cash-only offers, fixed rating tags (Lhenna's list), "worn" shows as "Well loved".
    Also in the draft: trade responses use "me"/"them", cash is whole pesos up to PHP 1,000,000,
    up to 4 photos per item (Proposed).
    Lhenna followed them in PR #21 (2026-11-09): ProposeForm has no cash-only offers, and
    condition labels and rating tags come from the contracts.
- [x] **[BE]** Mock data file built from the contracts
  - `src/shared/mocks/index.ts`, checked against the schemas by `tests/unit/shared/mocks.test.ts`.
- [x] **[FE]** Design tokens in `src/app/globals.css` with `@theme`, hex values from Figma
- [x] **[FE]** Fonts with `next/font`: Lilita One and Nunito
- [x] **[FE]** Layout shell: bottom nav on mobile, sidebar on desktop
- [x] **[FE]** Base components: Button, Input, Chip, Badge, Avatar, Card, Sheet, Toggle

### Done when

- `pnpm dev` works on both laptops.
- A pull request gets a Vercel preview and green checks.
- Base components match the Figma designs on a phone screen.
- Mock data compiles against the shared contracts.

---

## Phase 1: Accounts and profiles

Goal: a person can sign up, verify their email, pick hobbies, and have a
profile.

**Depends on:** Phase 0, minimum age decision.

### Tasks

- [x] **[BE]** Tables: users, hobbies, user_hobbies. Seed the hobby list
- [x] **[BE]** Enable RLS on all tables from day one
- [x] **[BE]** Supabase Auth: sign up, log in, log out, reset password (AUTH-01, AUTH-06)
  - Endpoints in `src/app/api/auth/`. Tested live on the dev project 2026-11-07.
    Email templates in Supabase point to `/api/auth/confirm` (`type=email` and `type=recovery`).
- [x] **[BE]** Email verification and custom SMTP (AUTH-05)
  - SMTP: Brevo free plan (300 emails a day), sending from a verified Gmail
    sender for now. Before launch: buy a domain and authenticate it in Brevo,
    so emails come from a Trybe address and don't land in spam.
    The Brevo SMTP key ("trybeapp") expires 2027-11-07, or after 90 days
    without use. When it expires, sign up and reset emails stop sending.
    When the app moves to Vercel, update the Site URL in Supabase Auth settings.
- [x] **[BE]** Turnstile verification on sign up and log in (AUTH-02)
  - Done 2026-11-13: Cloudflare widget `Trybe`, Lhenna's widget on all four forms (PR #26), and
    CAPTCHA turned on in Supabase with the widget's secret key (the secret lives only there).
    Checked from outside: sign up and log in without a token answer CAPTCHA_FAILED, and a real
    sign up on the live site sent the verification email.
- [x] **[BE]** Store terms acceptance and age confirmation (AUTH-03, AUTH-04)
  - The sign up trigger (migration 0004) refuses accounts without both and stores the times.
- [x] **[BE]** Endpoints: `GET /api/me`, `PATCH /api/me`, `GET /api/users/:handle`, `GET /api/hobbies`
- [x] **[BE]** Handle uniqueness and validation
- [x] **[BE]** Profile photo upload (shared upload helper, also used in Phase 2)
  - Built 2026-11-11: `POST` and `DELETE /api/me/photo`. The browser shrinks photos first
    (`src/shared/images/resizeForUpload.ts`, decided 2026-11-11), the server re-encodes with
    sharp (`src/server/uploads/`), files go to the public `photos` bucket (migration 0006).
    Left: apply migration 0006 to the dev database before merging (`pnpm db:migrate`);
    Lhenna wires Edit profile to `resizeForUpload()` and `POST /api/me/photo`.
- [x] **[Both]** Logo in one place: `src/shared/brand.ts` (added 2026-11-11)
  - Lhenna moved all screens, icons, and the offline page to `BRAND` (PR #26). Nothing is
    hard-coded any more.
- [x] **[BE]** Derived "new trader" flag (PROF-04)
  - `src/server/users/newTrader.ts`. Decided by Tristan 2026-11-10: the badge stays until the
    account is 30 days old AND has 3 completed trades. Lhenna to confirm.
- [x] **[BE]** "Other" hobby from onboarding (PROF-01)
  - Decided by Tristan 2026-11-10: typed hobbies are saved as hobby requests in their own
    table, not shown on the profile. Popular ones get added to the list by migration.
    Lhenna to confirm. Built 2026-11-10: `hobby_requests` table (migration 0005),
    `otherHobbies` in `PATCH /api/me` and `GET /api/me` (up to 5, owner only).
    Left: apply migration 0005 to the dev database before merging (`pnpm db:migrate`);
    Lhenna wires the onboarding "Other" field to `otherHobbies`.
- [x] **[FE]** Landing screen
- [x] **[FE]** Sign up with terms checkbox, age confirmation, Turnstile
- [x] **[FE]** Log in, forgot password, verify email screens
  - Also the reset password page and the resend link.
- [x] **[FE]** Onboarding: hobbies you have and want to try (PROF-01)
  - Wired 2026-11-14 (PR #29): `GET /api/hobbies`, then `PATCH /api/me` with `hobbies`,
    `otherHobbies`, and the city.
- [x] **[FE]** Own profile and other user's profile (PROF-02, PROF-03)
  - Both real (PR #29): other people's profiles read `getPublicProfile`. The posts and gear
    tabs are empty until `GET /api/users/:handle/posts` exists (added to Phase 2 below);
    trade history and reviews come with Phases 3 and 4.
- [x] **[FE]** Edit profile (PROF-06)
  - Saves name, handle, bio, city, and the profile photo (with crop). Log out works.
- [x] **[FE]** Settings screen layout (SET-01), links can be placeholders
  - Real since 2026-11-17: email (masked) and "Who can message me" (CHAT-06, `PATCH /api/me`).
    Left: change email and change password while logged in need endpoints (AUTH-07, BE);
    blocked users waits for Phase 5; notification toggles wait for NOTIF-03.
- [x] **[Both]** First drafts of Terms, Privacy Policy, Community Guidelines pages

### Done when

- A new user can sign up, receive the email, verify, onboard, and see their
  profile on a real phone.
- An unverified user cannot reach post or trade actions.
- No report count appears anywhere public (PROF-07).

---

## Phase 2: Items, posts, and feed

Goal: users can add gear, post what they made, and browse a feed.

**Depends on:** Phase 1, photo limit decision.

### Tasks

- [x] **[BE]** Tables: categories, items, item_photos, posts, post_photos, post_items, post_hobbies, likes, saves
  - Built 2026-11-13 (migrations 0007 to 0009), approved by Tristan: a separate `photos` table
    (upload first, attach by id), and `posts.hobby_id` instead of `post_hobbies` (one hobby per
    post). 74 categories seeded, "Other" last in every hobby. RLS on all, audit on items and posts.
    Left: apply migrations 0007 to 0009 to the dev database before merging (`pnpm db:migrate`).
- [x] **[BE]** Image pipeline: type check, size limit, strip EXIF and GPS, resize, WebP (TRD section 13)
  - `src/server/uploads/` (built with the profile photo) and `POST /api/photos` (2026-11-13):
    full size 1600px and 400px thumbnail. The browser shrinks first with `resizeForUpload()`.
- [x] **[BE]** Item endpoints: list mine, create, edit, delete (ITEM-01 to ITEM-05)
  - Plus `GET /api/categories?hobby=`. Reserved and traded items can't be edited or deleted.
- [x] **[BE]** Post endpoints: create, get, edit, delete (POST-01, POST-09)
- [x] **[BE]** Derive "for trade" from tagged items (POST-02)
  - Computed when read: a post is for trade while any tagged item is up for trade and available.
- [x] **[BE]** Feed endpoint with hobby filter and cursor pagination (POST-05)
  - Hidden posts and suspended authors are left out. Tested: no repeats when new posts arrive.
- [x] **[BE]** Like and save endpoints (POST-06, POST-07)
- [x] **[BE]** `GET /api/users/:handle/posts` and the person's gear up for trade, for the profile tabs (PROF-03)
  - Done 2026-11-17: `/api/users/:handle/posts` and `/api/users/:handle/items` (up for trade and
    available only). Tests run and passed by Tristan.
- [ ] **[BE]** Hide blocked and muted users' posts in the feed (ready for Phase 5 tables)
  - Waits for the blocks and mutes tables (Phase 5). Add the filter to `listFeed` in
    `src/server/posts/read.ts`, next to the hidden and suspended checks.
- [x] **[FE]** New post step 1: pick up to 6 photos, camera
  - UI done. Left: shrink with `resizeForUpload()` and upload to `POST /api/photos`.
- [x] **[FE]** New post step 2: title, caption, hobby, tools used
  - UI done on a sample hobby list. Left: `GET /api/hobbies` and save with `POST /api/posts`.
- [x] **[FE]** Add a tool sheet: photo, name, category, condition, up for trade, looking for
  - UI done on sample categories. Left: `GET /api/categories?hobby=` and `POST /api/items`.
- [x] **[FE]** Feed: hobby chips, Pinterest-style grid, "Up for trade" badge (POST-03)
  - UI done on `samplePosts`. Left: `GET /api/feed` with the hobby filter and cursor paging.
- [x] **[FE]** Post detail with tools list; "Propose a trade" only on for-trade posts (POST-04)
  - UI done on sample posts. Left: `GET /api/posts/:id`.
- [x] **[FE]** Like and save buttons with 44px tap areas
  - UI done, local state only. Left: `POST/DELETE /api/posts/:id/like` and `/save`.
- [x] **[FE]** Empty and loading states for feed and profile tabs

### Done when

- A user can add an item, post with photos, and see it in the feed.
- Uploaded photos have no GPS data (check one with an EXIF viewer).
- Feed scrolls without duplicates while new posts arrive.

---

## Phase 3: Trades core

Goal: the trade state machine works and is tested, and users can propose,
counter, accept, decline, and cancel.

**Depends on:** Phase 2.

### Tasks

- [x] **[BE]** Tables: trades, trade_offers, trade_offer_items
  - Built 2026-11-17 (migrations 0010 and 0011): RLS, audit, and checks for self-trades, cash
    (whole pesos, both amount and direction), and cancel reasons. Decided with Tristan: a deleted
    account keeps the other person's trade history (ids become null, "Deleted user"), and
    offers keep a copy of each item's name. Meetup and completion columns come with Phase 4.
    Left: apply 0010 and 0011 to the dev database before merging (`pnpm db:migrate`).
- [x] **[BE]** Deleting an item cancels the pending trades that use it (reason `item_unavailable`,
      decided 2026-11-17)
  - Trigger `trg_items_cancel_trades` (migration 0012), so it also runs when a deleted account
    takes its items. It also cancels accepted trades then and frees the other person's items.
- [x] **[BE]** State machine in `src/server/trades/` (TRD section 11)
  - `transitionTrade()` and `canRespond()` in `src/server/trades/stateMachine.ts` (Tristan,
    reviewed and completed 2026-11-13): outsiders, confirm complete, and API error codes.
- [x] **[BE]** Tests first: every allowed and forbidden transition
  - The whole matrix from `docs/testing.md` 7.1 as data in `tests/unit/server/trades/matrix.ts`
    (72 cases plus completion). The same matrix runs against the database functions in
    `tests/integration/db/trade-functions.test.ts` (confirm complete waits for Phase 4).
- [x] **[BE]** Tests: two people acting on the same trade at the same time
  - `tests/integration/db/trade-concurrency.test.ts` (2026-11-17): double accept, accept vs cancel,
    and five rounds of two trades racing for one item.
- [x] **[BE]** Tests: accepting a trade with an item already reserved elsewhere
- [x] **[BE]** Row locking with `SELECT ... FOR UPDATE` on trades and items
  - `app.trade_propose`, `_counter`, `_accept`, `_decline`, `_cancel` (migration 0012), called from
    `src/server/trades/write.ts`. Database codes become AppErrors in `dbErrors.ts`; a deadlock
    becomes `CONFLICT` (409, retry). Left: apply 0012 to the dev database (`pnpm db:migrate`).
- [x] **[BE]** Propose endpoint, requires verified email (TRD-01, TRD-02, TRD-09)
- [x] **[BE]** Counter, accept, decline, cancel endpoints (TRD-03, TRD-04, TRD-08)
- [x] **[BE]** On accept: reserve items, auto-cancel other pending trades using them (TRD-06)
  - Done in `app.trade_accept`. The endpoint itself comes with the accept endpoint above.
- [x] **[BE]** Trade list and trade detail endpoints
  - Done 2026-11-17: `POST /api/trades`, `GET /api/trades` (`?status=`, cursor paging, most
    recently changed first), `GET /api/trades/:id`, and `/counter`, `/accept`, `/decline`, `/cancel`.
    Every action returns the updated trade detail. Answers are from the viewer's side ("me"/"them").
    A trade someone isn't in is a 404, so ids can't be probed. Contract change for Lhenna to
    confirm: `other` is null for a deleted account ("Deleted user"), and offer items use
    `offerItemSchema` (id, condition, and thumbUrl null once the item is deleted). Meetup,
    completion, and ratedByMe are placeholders until Phase 4. Tests: `tests/integration/trades/`.
- [x] **[BE]** Return `409` with a clear error code on state conflicts
- [x] **[FE]** Propose a trade: pick their items and yours, balance with cash (with direction) or items (TRD-01, TRD-02)
- [x] **[FE]** Empty state when the user has no gear (TRD-10)
- [x] **[FE]** Trades list with status chips
- [x] **[FE]** Offer card with Accept, Counter, Decline
- [x] **[FE]** Waiting state when you made the current offer (TRD-05)
- [x] **[FE]** Counter offer screen
- [x] **[FE]** Handle `409` errors with a friendly message and a refresh
  - All Phase 3 screens are done on `sampleTrades`. Left: wire them to the trade endpoints
    once they exist (propose, counter, accept, decline, cancel, list, detail).

### Done when

- All trade tests pass in the pull request checks.
- Two browsers acting on the same trade at once always end in one clear result.
- An item cannot end up reserved in two trades.

---

## Phase 4: Chat, meetup, completion, ratings

Goal: a trade can go all the way from offer to rating.

**Depends on:** Phase 3.

### Tasks

- [ ] **[BE]** messages table with RLS so only trade members can read (TRD section 12)
- [ ] **[BE]** Send message endpoint with validation and block check (CHAT-01)
- [ ] **[BE]** Requests inbox logic for first contact (CHAT-02)
- [ ] **[BE]** Contact info detection for phone numbers and outside apps (CHAT-04)
- [ ] **[BE]** Offer and system messages written automatically on trade actions
- [ ] **[BE]** meetup_spots table, seed safe spots for starting cities (MEET-02)
- [ ] **[BE]** Meetup propose and confirm endpoints (MEET-01)
- [ ] **[BE]** Both-sides completion and "didn't show up" cancel (MEET-05, MEET-06)
- [ ] **[BE]** ratings table, one per rater per trade (RATE-01)
- [ ] **[BE]** Hide ratings until both rate or 7 days pass, using a scheduled job (RATE-02)
- [ ] **[BE]** notifications table and in-app notification endpoints (NOTIF-01)
- [ ] **[FE]** Chat screen with Supabase Realtime subscription (CHAT-05)
  - Chat UI done on sample messages. Left: the Realtime subscription and the send endpoint.
- [x] **[FE]** Requests tab with "Reply" or "Accept chat" wording (CHAT-03)
- [x] **[FE]** Contact info warning banner
  - Done in the browser while typing. Left: also show the server's CHAT-04 result.
- [x] **[FE]** Set up the meetup screen with map and checklist (MEET-03, MEET-04)
  - Leaflet + OpenStreetMap map added 2026-11-17 (`src/components/trades/MeetupMap.tsx`), on two
    sample Quezon City spots in the `MeetupSpot` contract shape. Left: `GET /api/meetup-spots?city=`
    and the meetup propose and confirm endpoints. Before launch, check the OpenStreetMap tile
    usage policy still fits our traffic.
- [x] **[FE]** Confirm handoff and "didn't show up" actions
- [x] **[FE]** Rate your trade screen (stars, tags, note)
- [x] **[FE]** Notifications list and bell badge
- [x] **[FE]** Desktop trades layout: list, chat, trade details panel
  - Phase 4 screens run on sample data. Left: wire them to the chat, meetup, completion,
    rating, and notification endpoints once they exist.

### Done when

- Two test accounts can finish a full trade on real phones: propose, counter,
  accept, chat, set meetup, confirm, rate.
- A third account cannot read that trade's messages, even through Supabase
  directly.
- Ratings stay hidden until both rate.

---

## Phase 5: Safety and compliance

Goal: everything Google Play and the law require is in place, so testers can
use the app safely.

**Depends on:** Phase 4.

### Tasks

- [ ] **[BE]** reports, blocks, mutes tables and endpoints (SAFE-01, SAFE-02, SAFE-03)
- [ ] **[BE]** Apply blocks everywhere: feed, search, profiles, chat, trades
- [ ] **[BE]** Admin role and admin-only endpoints
- [ ] **[BE]** Admin can hide content and suspend accounts (SAFE-05)
- [ ] **[BE]** Account deletion: cancel active trades, delete data (DEL-01, DEL-03)
- [ ] **[BE]** Rate limits on every API route, tighter on sign up, log in, posts, proposals,
      messages, reports. Pick the shared store first (TRD section 21)
- [ ] **[BE]** Security review against TRD section 14
- [ ] **[BE]** Purge jobs needed before launch (`docs/database.md` sections 8 and 9): enable
      pg_cron, `users_purge_unverified`, `audit_log_purge`, and orphan photo cleanup.
      The other jobs come with the features they clean up after.
- [ ] **[BE]** Index check before launch (`docs/database.md` section 6.3): no unused
      indexes, no foreign keys without an index
- [x] **[FE]** Report flow from profiles, posts, trades, reviews, messages
- [x] **[FE]** Block and mute from profile menu; blocked users list in settings
- [x] **[FE]** Simple admin page for the report queue (SAFE-04)
- [x] **[FE]** Delete account flow with a clear confirmation screen
- [x] **[FE]** Public account deletion page that works without the app (DEL-02)
- [x] **[FE]** Safety tips page and "Trade safely" card (SAFE-06)
  - Phase 5 screens are UI only. Left: wire report, block, mute, the admin queue, and
    account deletion to their endpoints once they exist.
- [ ] **[Both]** Final Terms, Privacy Policy, Community Guidelines (SAFE-07)
- [ ] **[Both]** Legal pages per TRD section 15 "Legal pages and consent": cookies and third
      parties in the privacy policy, no-refund line in the Terms, re-ask when the Terms change,
      and check the local laws listed there
- [ ] **[Both]** Accessibility pass: contrast, 44px targets, labels, alt text, keyboard-only use,
      and a list of font, icon, and image licenses (TRD section 16)

### Done when

- Every item in TRD section 15 "Google Play" is checked.
- A blocked user disappears from the blocker's app everywhere.
- Deleting an account removes the user's data and frees their reserved items.

**Next:** start the Play Store closed test (Phase 7, first part).

---

## Phase 6: Explore, PWA, and polish

Goal: discovery works, the app installs well, and it feels finished.
Runs during the closed test.

**Depends on:** Phase 5 and the open decisions listed above.

### Tasks

- [ ] **[BE]** Search endpoint for posts, items, people (EXP-02)
- [ ] **[BE]** Hobby counts and "near you" by city (EXP-01, EXP-03)
- [ ] **[BE]** Web push notifications (NOTIF-02)
- [ ] **[BE]** Sitemap, robots.txt, metadata for public pages
  - robots.txt done 2026-11-11 (`src/app/robots.ts`): production allows public pages and blocks
    logged-in ones; previews and local builds block everything. Left: `src/app/sitemap.ts`
    (then add it to robots.ts), and per-page titles and descriptions for posts and profiles.
- [x] **[FE]** Explore screen
- [x] **[FE]** Search screen and results
  - Explore and search run on sample data. Left: wire to the search, hobby count, and
    "near you" endpoints (EXP-01 to EXP-03).
- [x] **[FE]** Notification settings toggles (NOTIF-03)
  - UI only. Left: save the settings once the endpoint exists.
- [x] **[FE]** PWA manifest, icons, offline page
- [x] **[FE]** Unique titles and descriptions for posts and profiles
  - Profiles use real data. Posts still read sample posts until post detail is wired.
- [ ] **[Both]** Performance pass against TRD section 16 (the "Speed" row: lazy loading,
      debounced search, caching)
- [ ] **[Both]** Fix bugs reported by closed test testers
- [ ] **[Both]** Build any open-decision features you chose to include

### Done when

- The app installs from the browser on Android and shows the offline page
  without a connection.
- Feed loads within the TRD target on a mid-range Android phone.
- No open bugs marked critical from testers.

---

## Phase M: Mobile app (Expo)

Goal: a native Android app with native mobile design, on the same API as the
website. Each screen is built once its endpoints exist.

**Depends on:** the docs update (this change), Tristan's mobile log in.

### Setup

- [ ] **[FE]** Expo app in `mobile/` with Expo Router and TypeScript (strict), added to the pnpm workspace
- [ ] **[FE]** NativeWind with the `DESIGN.md` tokens, light, dark, and high contrast
- [ ] **[FE]** Fonts (Lilita One, Nunito) and `phosphor-react-native` icons
- [ ] **[FE]** App shell: native tab bar (Feed, Explore, +, Trades, Profile), stack screens, safe areas
- [ ] **[FE]** API client: `apiRequest` from `src/shared/` with the API URL and Bearer token, TanStack Query
- [ ] **[FE]** App icon and splash screen from the Figma App Logo page
- [ ] **[BE]** Log in and sign up return the session for the app (TRD section 10, Auth)
- [ ] **[BE]** `/captcha` page for Turnstile in a WebView, or another bot check (TRD section 21)
- [ ] **[BE]** Confirm the API accepts Bearer tokens on every endpoint

### Screens

- [ ] **[FE]** Welcome, sign up (terms, age, Turnstile), log in, forgot password, verify email (AUTH-01 to AUTH-06)
- [ ] **[FE]** Onboarding: hobbies and city (PROF-01)
- [ ] **[FE]** Feed with hobby chips and pull to refresh (POST-03, POST-05)
- [ ] **[FE]** Post detail, like, save, "Propose a trade" only on for-trade posts (POST-04, POST-06, POST-07)
- [ ] **[FE]** New post and add a tool: camera, photo picker, shrink before upload (POST-01, ITEM-01)
- [ ] **[FE]** Profile, other people's profiles, edit profile with photo (PROF-02, PROF-03, PROF-06)
- [ ] **[FE]** Propose, counter, trades list, offer card, waiting state (TRD-01 to TRD-10)
- [ ] **[FE]** Chat with Realtime, requests, contact info warning (CHAT-01 to CHAT-05)
- [ ] **[FE]** Meetup with map and checklist, confirm handoff, rate (MEET-01 to MEET-06, RATE-01)
- [ ] **[FE]** Notifications and push (NOTIF-01, NOTIF-02)
- [ ] **[FE]** Explore and search (EXP-01, EXP-02)
- [ ] **[FE]** Settings, report, block, mute, delete account, safety tips (SET-01, SAFE-01 to SAFE-06, DEL-01)

### Done when

- The full trade flow works in the app on a real Android phone.
- The app passes the same safety checks as the website (report, block, delete account).
- Every screen works in light, dark, and high contrast.

---

## Phase 7: Play Store launch

Goal: Trybe is live on the web and Google Play.

### Part A: Start right after Phase 5

- [ ] **[BE]** Supabase production project on the Pro plan, backups on
- [ ] **[BE]** Production environment variables in Vercel
- [ ] **[BE]** Domain connected to Vercel
- [ ] **[Both]** Create the Google Play developer account
- [ ] **[FE]** Build the app with EAS Build and upload it with EAS Submit (replaces PWABuilder, decided 2026-11-18)
- [ ] **[Both]** Store listing: name, description, screenshots, icon, privacy policy URL
- [ ] **[Both]** Data safety form, including account deletion link
- [ ] **[Both]** Content rating questionnaire, answer honestly about user content
- [ ] **[Both]** Recruit at least 15 testers (aim higher than 12 in case some drop out)
- [ ] **[Both]** Start the closed test and keep testers opted in for 14 days

### Part B: After the closed test

- [ ] **[Both]** Apply for production access in Play Console
- [ ] **[Both]** Final check: the app on a real Android phone, the website on a real iPhone
- [ ] **[BE]** Run production migrations, check Sentry is receiving events
- [ ] **[Both]** Release to production
- [ ] **[Both]** Watch reports, errors, and sign ups daily for the first two weeks

### Done when

- Trybe is downloadable from Google Play and reachable on the web.
- Reports are being reviewed within a set time.

---

## After launch (not planned yet)

- Apple App Store for the Expo app, if not done at launch
- Google sign in (AUTH-08)
- Followers, saved boards, "Wanted" posts if cut from v1
- Moving to Vercel Pro and registering a business once Trybe earns money
