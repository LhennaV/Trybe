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
- Update the progress table when a phase is done.
- Phase targets are rough. Move them when school gets busy, and write down
  the new target instead of skipping work.

Tags: **[BE]** Tristan, **[FE]** Lhenna, **[Both]** together.

## Progress

| Phase | Name                              | Target | Status      |
| ----- | --------------------------------- | ------ | ----------- |
| 0     | Foundation                        | TBD    | In progress |
| 1     | Accounts and profiles             | TBD    | Not started |
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
- [ ] **[BE]** Add `AGENTS.md`, `docs/technical-requirements.md`, this plan
- [ ] **[BE]** Update `README.md`: stack, setup steps, pnpm only, branch rules
- [ ] **[BE]** Create Supabase dev project
- [ ] **[BE]** Set up Drizzle, database connection (pooled and direct), first empty migration
- [ ] **[BE]** `.env.example` with every variable from TRD section 17
- [ ] **[BE]** Deploy to Vercel, preview deploys on pull requests
- [ ] **[BE]** Pull request checks: lint, type check, test, build
- [ ] **[BE]** Set up Vitest with one passing test
- [ ] **[BE]** Set up Sentry (client and server)
- [ ] **[BE]** `src/shared/contracts/common.ts`: response shape, error codes, pagination
- [ ] **[Both]** Draft contracts for users, items, posts, trades in `src/shared/contracts/`
- [ ] **[BE]** Mock data file built from the contracts
- [ ] **[FE]** Design tokens in `src/app/globals.css` with `@theme`, hex values from Figma
- [ ] **[FE]** Fonts with `next/font`: Lilita One and Nunito
- [ ] **[FE]** Layout shell: bottom nav on mobile, sidebar on desktop
- [ ] **[FE]** Base components: Button, Input, Chip, Badge, Avatar, Card, Sheet, Toggle
- [ ] **[Both]** Turn on branch protection for `main` (pull request and review required)

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

- [ ] **[BE]** Tables: users, hobbies, user_hobbies. Seed the hobby list
- [ ] **[BE]** Enable RLS on all tables from day one
- [ ] **[BE]** Supabase Auth: sign up, log in, log out, reset password (AUTH-01, AUTH-06)
- [ ] **[BE]** Email verification and custom SMTP (AUTH-05)
- [ ] **[BE]** Turnstile verification on sign up and log in (AUTH-02)
- [ ] **[BE]** Store terms acceptance and age confirmation (AUTH-03, AUTH-04)
- [ ] **[BE]** Endpoints: `GET /api/me`, `PATCH /api/me`, `GET /api/users/:handle`, `GET /api/hobbies`
- [ ] **[BE]** Handle uniqueness and validation
- [ ] **[BE]** Profile photo upload (shared upload helper, also used in Phase 2)
- [ ] **[BE]** Derived "new trader" flag (PROF-04)
- [ ] **[FE]** Landing screen
- [ ] **[FE]** Sign up with terms checkbox, age confirmation, Turnstile
- [ ] **[FE]** Log in, forgot password, verify email screens
- [ ] **[FE]** Onboarding: hobbies you have and want to try (PROF-01)
- [ ] **[FE]** Own profile and other user's profile (PROF-02, PROF-03)
- [ ] **[FE]** Edit profile (PROF-06)
- [ ] **[FE]** Settings screen layout (SET-01), links can be placeholders
- [ ] **[Both]** First drafts of Terms, Privacy Policy, Community Guidelines pages

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

- [ ] **[BE]** Tables: categories, items, item_photos, posts, post_photos, post_items, post_hobbies, likes, saves
- [ ] **[BE]** Image pipeline: type check, size limit, strip EXIF and GPS, resize, WebP (TRD section 13)
- [ ] **[BE]** Item endpoints: list mine, create, edit, delete (ITEM-01 to ITEM-05)
- [ ] **[BE]** Post endpoints: create, get, edit, delete (POST-01, POST-09)
- [ ] **[BE]** Derive "for trade" from tagged items (POST-02)
- [ ] **[BE]** Feed endpoint with hobby filter and cursor pagination (POST-05)
- [ ] **[BE]** Like and save endpoints (POST-06, POST-07)
- [ ] **[BE]** Hide blocked and muted users' posts in the feed (ready for Phase 5 tables)
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
- [ ] **[BE]** State machine in `src/server/trades/` (TRD section 11)
- [ ] **[BE]** Tests first: every allowed and forbidden transition
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
