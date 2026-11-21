# Changelog

What changed in each version of Trybe, in plain words. Newest first.

How versions work (details in the README, "Versions and releases"):

- `0.MINOR.PATCH` until launch. MINOR goes up when a phase or a big
  feature is done, PATCH for fixes only. `1.0.0` is the Play Store launch.
- Add a line under **Unreleased** in the same pull request as the change.
- At release time, Unreleased becomes the new version with its date, and the
  merge commit gets a git tag (`v0.2.0`).

## [Unreleased]

### Added

- Rate a trade after it's completed: stars, tags, and a note. Ratings stay
  hidden until both people rate or 7 days pass. Profiles show the real
  rating, review count, and number of completed trades.
- Backend for the reviews tab on profiles (`GET /api/users/:handle/reviews`).
- Log in for the mobile app (`POST /api/auth/token`): returns the session
  tokens instead of cookies. Log out also works with the app's token.
- Confirm the handoff (`POST /api/trades/:id/complete`): a trade is completed
  only when both people confirm, and its items are marked traded.

## [0.3.0] - 2026-11-18

### Added

- Backend for the profile tabs: a person's posts, and their gear that's up
  for trade (`GET /api/users/:handle/posts` and `/items`).
- Trades in the database: propose, counter, accept, decline, and cancel, with
  row locking so two people acting at once always get one clear result.
  Accepting reserves the items and cancels other pending trades for them.
  Deleting an item or an account cancels the trades that used it.
- Trade endpoints: propose, counter, accept, decline, cancel, your trades
  list, and trade details (`/api/trades`).

### Changed

- Settings, Profile, Trades, Notifications, New post, Saved, Report, Admin,
  onboarding, and Propose a trade now send you to Log in when you're logged
  out, then bring you back after you log in.
- Logged out, the feed hides account-only parts (trades count, notifications,
  "For you", hobby matches) and shows a "Sign up" banner instead.
- The meetup screen has a real map (OpenStreetMap) with the suggested safe
  spots. Pick a spot from the list or tap its pin.
- Settings shows your real email (partly hidden), and "Who can message me"
  now works: pick anyone or only people you've traded with. The fake
  blocked-users count and sample blocked people are gone until blocking
  arrives.
- Tablets get more room: full-screen pages (chat, post, settings, forms) use a
  wider column instead of a phone-width strip, the feed shows 3 columns, and
  post photos keep a 4:3 shape.
- Saved fills the screen on desktop like the feed, with posts in 5 columns.
- Starter kits on Explore can be tapped.
- The feed no longer has its own search bar. Search lives in Explore.
- No cash icon on the cash amount field or the landing page cash chip.
- On desktop, clicking a message request opens it on the right with Accept
  chat, Decline, and Report. Accept and Decline now respond (they stay on this
  screen until chats are connected).
- Report, Propose a trade, Counter offer, Meetup, Check-in, and Rate look
  like desktop pages instead of a phone card on big screens.
- The password checklist on sign up and reset password now asks for a
  lowercase letter too (5 rules). It uses the same rules as the server, so a
  password the form accepts is never refused by Supabase.

### Docs

- The store app will be a native Expo (React Native) app with native mobile
  design, not the website packaged for Google Play. AGENTS.md, the TRD,
  DESIGN.md, and the plan (new Phase M) are updated.

## [0.2.0] - 2026-11-14

Accounts and profiles are done (Phase 1), plus the backend for gear, posts,
and the feed (Phase 2) and the trade rules (Phase 3). Live at
https://trybe-puce.vercel.app on the dev database.

### Added

- Profile photos: upload, replace, and remove from Edit profile
  (`POST` and `DELETE /api/me/photo`). Photos are shrunk on the phone first,
  then turned upright, stripped of location data, and saved as WebP.
- Turnstile bot check on sign up, log in, forgot password, and "send the
  link again".
- Edit profile saves for real: name, handle, bio, and city. Add a profile
  photo from the camera or your library, crop it, or remove it.
- Your profile page and the sidebar show your real name, photo, handle,
  and city, and update right after you save.
- Log out in Settings works (it did nothing before).
- Settings looks right on desktop: no back button, bigger titles, lined up
  with the rest of the app.
- The landing page menu highlights the section you're reading.
- Deleting your account asks twice: type DELETE, then a last check. The
  deletion itself arrives in Phase 5; until then the screen says so.
- Onboarding saves your hobbies (including "Other") and your city.
- Other people's profiles show their real name, photo, city, and hobbies.
- Sign up checks as you type: a free handle (with suggestions if yours is
  taken), email typos like gmial.com, and a password checklist (8+
  characters, uppercase, number, symbol). Reset password uses it too.
- Brand assets in one place (`src/shared/brand.ts`), so changing the logo
  means changing one file. Every screen and the app icons now use it.
- `robots.txt`: search engines can find public pages on the live site;
  preview links and logged-in pages stay out of search results.
- Backend for gear and posts, ready for the screens: add, edit, and remove
  gear with photos and a category; post what you made with up to 6 photos
  and the gear you used; a post is "Up for trade" on its own when tagged gear
  is; a feed by hobby that never shows the same post twice while scrolling;
  likes and saves.
- Trade rules: who can counter, accept, decline, cancel, and confirm a trade,
  checked against every case before any trade screen is built.

### Docs

- Database guide: index rules and checks, purge job status, and what
  happens to photo files.

## [0.1.0] - 2026-11-10

The foundation (Phase 0) and most of accounts and profiles (Phase 1).
Live at https://trybe-puce.vercel.app on the dev database.

### Added

- Every screen designed in Figma, mobile first with desktop layouts,
  running on sample data: feed, post detail, new post, trades and chat,
  meetup, ratings, notifications, explore, search, saved, settings, safety,
  report, block, and the admin queue.
- Landing page, About page, and Terms, Privacy, and Community Guidelines.
- Design tokens, fonts, light, dark, and high contrast themes, and the base
  components (buttons, inputs, chips, sheets, avatars, cards).
- Installable app (PWA) with an offline page.
- Accounts: sign up with terms and age confirmation, email verification,
  log in, log out, and password reset. Verification and reset emails are
  sent through Brevo with Trybe's own templates.
- Profiles: handle, display name, bio, city, and hobbies you have or want
  to try. Hobbies not on the list are saved as requests.
- "New trader" badge until an account is 30 days old and has 3 trades.
- Hobby list (15 hobbies) from the API.
- Audit trail of profile changes, and Row Level Security on every table.
- Shared contracts and mock data for items, posts, and trades.
- Tests: unit, integration against a local test database, end to end in a
  real browser, and performance. Lint, type check, tests, and build run on
  every pull request.
- Error tracking with Sentry and deploys to Vercel.

[Unreleased]: https://github.com/LhennaV/Trybe/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/LhennaV/Trybe/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/LhennaV/Trybe/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/LhennaV/Trybe/releases/tag/v0.1.0
