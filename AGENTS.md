# Trybe: Agent Guide

Read this before writing any code. If a task conflicts with this file, stop and ask.

## What Trybe is

A mobile-first app for trading hobby tools and equipment. Users post what they
made plus the tools they used, browse a Pinterest-style feed by hobby, and
propose trades on tagged items: item for item, or with a cash or item top-up.
Cash is agreed in the app and handed over in person. Trybe never holds or
sends money and does not handle shipping.

Trust comes from ratings, trade history, account age, email verification, and
a "new trader" badge. The UI must never imply more protection than that.

Delivered as a web app and an installable PWA, packaged for Google Play.
A native app (Expo) may come later, so the API must work for any client.

Tagline: "Curiosity killed the cat. Trybe brought it back."

## Team and ownership

- Lhenna: design and frontend
- Tristan: backend

| Path | Owner |
| --- | --- |
| `src/app/` (pages, layouts) | Lhenna |
| `src/app/api/` | Tristan |
| `src/components/` | Lhenna |
| `src/styles/`, `src/app/globals.css` | Lhenna |
| `src/server/` | Tristan |
| `tests/` | Tristan |
| `src/shared/` | Both. Changes need agreement from both. |

Do not edit files outside the area of the person you are working for unless
they ask.

## Tech stack

- Next.js (App Router, `src/` directory), React, TypeScript (strict)
- Tailwind CSS, tokens defined with `@theme` in `src/app/globals.css`
- PostgreSQL on Supabase
- Drizzle ORM and Drizzle migrations
- Zod for validation, schemas in `src/shared/`
- Supabase Auth with email verification, custom SMTP in production
- Supabase Storage for photos, resized on upload
- Supabase Realtime for chat
- Leaflet + OpenStreetMap for maps
- Cloudflare Turnstile for bot protection
- Sentry for errors
- Hosted on Vercel

Do not add a new framework, database, auth provider, or paid service without
asking first.

## Commands

pnpm only. Never use npm or yarn, never commit `package-lock.json`.

- `pnpm dev` start the dev server
- `pnpm build` production build
- `pnpm lint` lint
- `pnpm add <pkg>` add a dependency

## Architecture rules

1. Business logic lives in `src/server/`, never inside route files or
   components. API routes in `src/app/api/` only parse input, call a server
   function, and return the result.
2. All database writes go through our API or server code. The browser never
   writes to Supabase directly.
3. The browser may read chat messages through Supabase Realtime. Those tables
   must have Row Level Security so only the two people in a trade can read
   its messages.
4. Validate every input with a Zod schema from `src/shared/`. The same schema
   is used on the client and the server.
5. Schema changes only through Drizzle migrations. Never edit tables by hand
   in the Supabase dashboard.
6. Use the Supabase connection pooler from serverless functions.
7. Only add `"use client"` to components that need it (state, events,
   browser APIs). Default to server components.

## Data model (draft, confirm before changing)

- users: id, email, display_name, handle, photo, bio, city, birthdate or
  age confirmation, email_verified, message_permission, created_at.
  `is_new_trader` is derived from account age, not stored.
- hobbies, user_hobbies (with level: "has" or "trying")
- categories: belongs to a hobby (e.g. "Wheels & kilns" belongs to Pottery)
- items (a user's gear): owner_id, name, category_id, condition
  (like_new, good, fair, worn), photos, up_for_trade, looking_for (text),
  status (available, reserved, traded)
- posts: user_id, title, caption, photos. "For trade" vs "inspiration" is
  derived: a post is for trade if any linked item is up for trade.
- post_items, post_hobbies (many to many)
- trades: initiator_id, recipient_id, status, current_offer_id, meetup spot,
  meetup time, meetup confirmed by each side, completed confirmed by each
  side, created_at, updated_at
- trade_offers: trade_id, made_by, items given by each side, cash_amount,
  cash_from (initiator or recipient), created_at. Every offer and counter is
  a new row. The trade points to the latest one.
- messages: trade_id, sender_id, type (text or offer), body, offer_id,
  created_at
- ratings: trade_id, rater_id, ratee_id, score, tags, note. One per rater per
  trade.
- reports (with reason and target: user, post, trade, review, message),
  blocks, mutes

## Trade rules

Statuses: `pending`, `accepted`, `completed`, `declined`, `cancelled`.

- A counter offer is a new `trade_offers` row. The trade stays `pending` and
  points to the new offer. There is no separate "countered" status.
- Only the person who did NOT make the current offer can accept, decline, or
  counter it. The other person sees a waiting state.
- Every action that changes a trade runs in a transaction and locks the trade
  row first (`SELECT ... FOR UPDATE`), then re-checks the status.
- When a trade is accepted, its items become `reserved`. Any other pending
  trade using those items is cancelled automatically.
- A trade is `completed` only when BOTH people confirm the handoff.
- Either side can cancel before completion, including "they didn't show up",
  which also creates a report. Reserved items go back to `available`.
- Ratings are hidden until both people rate or 7 days pass.
- Write tests for the trade state machine before building trade endpoints.

## Safety and Play Store requirements

These are required, not optional:

- Users accept the Terms and Community Guidelines before they can post.
- Report and block are available for users, posts, trades, reviews, and
  messages, clearly labeled, inside the app.
- Account deletion is available in the app and on a public web page, and it
  really deletes the user's data (not just deactivation).
- Email verification is required before proposing a trade.
- Never show a user's report count publicly.
- Safety copy says ratings reduce risk, they do not guarantee it.
- Collect only the data we need. Show city, never exact location.

## Design and UI

- Mobile first. Build the phone layout first, then tablet and desktop.
- Tap targets at least 44px, even when the icon is smaller.
- No hover-only interactions.
- Bottom navigation on mobile, sidebar on desktop.
- Use named tokens (`trybe-lavender`, `trybe-coral`, `trybe-yellow`,
  `trybe-mint`, `trybe-sky`, `trybe-cream`), never raw hex in components.
- Fonts: Lilita One for headings and the wordmark, Nunito for body and UI.
- Tone: playful and witty, not corporate.
- Check text contrast, especially light gray on cream.

## Code conventions

- Components: PascalCase, one component per file
- Hooks and utilities: camelCase
- Group backend code by feature: `src/server/trades`, `src/server/items`
- Secrets only in `.env.local` and Vercel env vars. Never commit them.
- The Supabase service role key is server-only. It must never appear in
  client code or in any file under `src/components/` or a client component.

## Git workflow

- Short branches per feature: `feat/feed-card`, `fix/trade-locking`,
  `chore/...`
- Open a pull request into `main`. CODEOWNERS assigns the reviewer.
- Do not push directly to `main`.

## Not in v1

- In-app payments, shipping, rentals, automatic pricing
- Formal dispute resolution beyond reports and ratings
- Apple App Store and a native app

## Open decisions (ask before building)

- Followers
- Saved boards (vs a simple save)
- "Wanted near you" posts
- "Replies in ~1 hr", dark mode, weekly email digest
- Minimum user age
