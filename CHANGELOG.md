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

- Profile photos: upload, replace, and remove from Edit profile
  (`POST` and `DELETE /api/me/photo`). Photos are shrunk on the phone first,
  then turned upright, stripped of location data, and saved as WebP.
- Brand assets in one place (`src/shared/brand.ts`), so changing the logo
  means changing one file.
- `robots.txt`: search engines can find public pages on the live site;
  preview links and logged-in pages stay out of search results.

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

[Unreleased]: https://github.com/LhennaV/Trybe/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/LhennaV/Trybe/releases/tag/v0.1.0
