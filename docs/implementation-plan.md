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
| 1     | Accounts and profiles             | TBD    | In progress |
| 2     | Items, posts, and feed            | TBD    | Not started |
| 3     | Trades core                       | TBD    | Not started |
| 4     | Chat, meetup, completion, ratings | TBD    | Not started |
| 5     | Safety and compliance             | TBD    | Not started |
| 6     | Explore, PWA, and polish          | TBD    | Not started |
| 7     | Play Store launch                 | TBD    | Not started |

## Timeline shape

```
Phase 0 → 1 → 2 → 3 → 4 → 5 ──→ 6 ─────────────→ 7
                              └─ Play Store closed test runs here (14+ days)
```

The Google Play closed test needs at least 12 testers for 14 days in a row.
Start it as soon as Phase 5 is done, and build Phase 6 while it runs, so the
14 days are not wasted waiting.

## Decisions needed before each phase

| Before phase | Decision                                           | See            |
| ------------ | -------------------------------------------------- | -------------- |
| 1            | Minimum user age                                   | TRD section 21 |
| 1            | Default "who can message me"                       | TRD section 21 |
| 2            | Item photo limit and max upload size               | TRD section 13 |
| 2            | Saved boards or simple save                        | TRD section 21 |
| 6            | Followers, "Wanted" posts, dark mode, email digest | TRD section 21 |

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
- [ ] **[FE]** Onboarding: hobbies you have and want to try (PROF-01)
  - Not wired yet: still a sample hobby list and nothing is saved. Use `GET /api/hobbies` and
    `PATCH /api/me` (`hobbies`, `city`, and `otherHobbies` for the "Other" field).
- [ ] **[FE]** Own profile and other user's profile (PROF-02, PROF-03)
  - Own profile is real (`MyProfile`, 2026-11-13). Left: other users' profiles still use sample
    data; call `GET /api/users/:handle`.
- [x] **[FE]** Edit profile (PROF-06)
  - Saves name, handle, bio, city, and the profile photo (with crop). Log out works.
- [x] **[FE]** Settings screen layout (SET-01), links can be placeholders
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
- [ ] **[BE]** Hide blocked and muted users' posts in the feed (ready for Phase 5 tables)
  - Waits for the blocks and mutes tables (Phase 5). Add the filter to `listFeed` in
    `src/server/posts/read.ts`, next to the hidden and suspended checks.
- [ ] **[FE]** New post step 1: pick up to 6 photos, camera
- [ ] **[FE]** New post step 2: title, caption, hobby, tools used
- [ ] **[FE]** Add a tool sheet: photo, name, category, condition, up for trade, looking for
- [ ] **[FE]** Feed: hobby chips, Pinterest-style grid, "Up for trade" badge (POST-03)
- [ ] **[FE]** Post detail with tools list; "Propose a trade" only on for-trade posts (POST-04)
- [ ] **[FE]** Like and save buttons with 44px tap areas
- [ ] **[FE]** Empty and loading states for feed and profile tabs

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

- [ ] **[BE]** Tables: trades, trade_offers, trade_offer_items
- [x] **[BE]** State machine in `src/server/trades/` (TRD section 11)
  - `transitionTrade()` and `canRespond()` in `src/server/trades/stateMachine.ts` (Tristan,
    reviewed and completed 2026-11-13): outsiders, confirm complete, and API error codes.
- [x] **[BE]** Tests first: every allowed and forbidden transition
  - The whole matrix from `docs/testing.md` 7.1 as data in `tests/unit/server/trades/matrix.ts`
    (72 cases plus completion). Left for the database functions: run the same matrix against
    Postgres once `app.trade_*` exists.
- [ ] **[BE]** Tests: two people acting on the same trade at the same time
- [ ] **[BE]** Tests: accepting a trade with an item already reserved elsewhere
- [ ] **[BE]** Row locking with `SELECT ... FOR UPDATE` on trades and items
- [ ] **[BE]** Propose endpoint, requires verified email (TRD-01, TRD-02, TRD-09)
- [ ] **[BE]** Counter, accept, decline, cancel endpoints (TRD-03, TRD-04, TRD-08)
- [ ] **[BE]** On accept: reserve items, auto-cancel other pending trades using them (TRD-06)
- [ ] **[BE]** Trade list and trade detail endpoints
- [ ] **[BE]** Return `409` with a clear error code on state conflicts
- [ ] **[FE]** Propose a trade: pick their items and yours, balance with cash (with direction) or items (TRD-01, TRD-02)
- [ ] **[FE]** Empty state when the user has no gear (TRD-10)
- [ ] **[FE]** Trades list with status chips
- [ ] **[FE]** Offer card with Accept, Counter, Decline
- [ ] **[FE]** Waiting state when you made the current offer (TRD-05)
- [ ] **[FE]** Counter offer screen
- [ ] **[FE]** Handle `409` errors with a friendly message and a refresh

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
- [ ] **[FE]** Requests tab with "Reply" or "Accept chat" wording (CHAT-03)
- [ ] **[FE]** Contact info warning banner
- [ ] **[FE]** Set up the meetup screen with map and checklist (MEET-03, MEET-04)
- [ ] **[FE]** Confirm handoff and "didn't show up" actions
- [ ] **[FE]** Rate your trade screen (stars, tags, note)
- [ ] **[FE]** Notifications list and bell badge
- [ ] **[FE]** Desktop trades layout: list, chat, trade details panel

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
- [ ] **[BE]** Rate limits on sign up, log in, posts, proposals, messages, reports
- [ ] **[BE]** Security review against TRD section 14
- [ ] **[BE]** Purge jobs needed before launch (`docs/database.md` sections 8 and 9): enable
      pg_cron, `users_purge_unverified`, `audit_log_purge`, and orphan photo cleanup.
      The other jobs come with the features they clean up after.
- [ ] **[BE]** Index check before launch (`docs/database.md` section 6.3): no unused
      indexes, no foreign keys without an index
- [ ] **[FE]** Report flow from profiles, posts, trades, reviews, messages
- [ ] **[FE]** Block and mute from profile menu; blocked users list in settings
- [ ] **[FE]** Simple admin page for the report queue (SAFE-04)
- [ ] **[FE]** Delete account flow with a clear confirmation screen
- [ ] **[FE]** Public account deletion page that works without the app (DEL-02)
- [ ] **[FE]** Safety tips page and "Trade safely" card (SAFE-06)
- [ ] **[Both]** Final Terms, Privacy Policy, Community Guidelines (SAFE-07)
- [ ] **[Both]** Accessibility pass: contrast, 44px targets, labels

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
- [ ] **[FE]** Explore screen
- [ ] **[FE]** Search screen and results
- [ ] **[FE]** Notification settings toggles (NOTIF-03)
- [ ] **[FE]** PWA manifest, icons, offline page
- [ ] **[FE]** Unique titles and descriptions for posts and profiles
- [ ] **[Both]** Performance pass against TRD section 16
- [ ] **[Both]** Fix bugs reported by closed test testers
- [ ] **[Both]** Build any open-decision features you chose to include

### Done when

- The app installs from the browser on Android and shows the offline page
  without a connection.
- Feed loads within the TRD target on a mid-range Android phone.
- No open bugs marked critical from testers.

---

## Phase 7: Play Store launch

Goal: Trybe is live on the web and Google Play.

### Part A: Start right after Phase 5

- [ ] **[BE]** Supabase production project on the Pro plan, backups on
- [ ] **[BE]** Production environment variables in Vercel
- [ ] **[BE]** Domain connected to Vercel
- [ ] **[Both]** Create the Google Play developer account
- [ ] **[FE]** Package the PWA with PWABuilder, set up `assetlinks.json`
- [ ] **[Both]** Store listing: name, description, screenshots, icon, privacy policy URL
- [ ] **[Both]** Data safety form, including account deletion link
- [ ] **[Both]** Content rating questionnaire, answer honestly about user content
- [ ] **[Both]** Recruit at least 15 testers (aim higher than 12 in case some drop out)
- [ ] **[Both]** Start the closed test and keep testers opted in for 14 days

### Part B: After the closed test

- [ ] **[Both]** Apply for production access in Play Console
- [ ] **[Both]** Final check on a real Android phone and a real iPhone (web)
- [ ] **[BE]** Run production migrations, check Sentry is receiving events
- [ ] **[Both]** Release to production
- [ ] **[Both]** Watch reports, errors, and sign ups daily for the first two weeks

### Done when

- Trybe is downloadable from Google Play and reachable on the web.
- Reports are being reviewed within a set time.

---

## After launch (not planned yet)

- Expo native app and Apple App Store
- Google sign in (AUTH-08)
- Followers, saved boards, "Wanted" posts if cut from v1
- Moving to Vercel Pro and registering a business once Trybe earns money
