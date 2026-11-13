# Trybe Testing Guide

|              |                                                                              |
| ------------ | ---------------------------------------------------------------------------- |
| Version      | 0.2                                                                          |
| Last updated | 2026-11-09                                                                   |
| Related      | `docs/technical-requirements.md` (section 18), `docs/implementation-plan.md` |

This guide explains what we test, how, and when, and how to run each kind of
test. Everything in sections 3 to 5 is set up and working.

## 1. Principles

1. **Test the rules, not the pixels.** Most tests target `src/server/`,
   where the business rules live. UI is checked mostly by end-to-end and
   manual tests.
2. **Trade logic is never merged without tests.** It is the part most likely
   to break trust if it goes wrong.
3. **Test against real Postgres.** Locking, constraints, triggers, and Row
   Level Security only behave correctly on a real database. No fake databases
   for trade or security tests.
4. **Every bug gets a test.** When a bug is fixed, add a test that would have
   caught it (section 12).
5. **Tests run on every pull request.** A failing test blocks the merge.
6. **No coverage percentage target.** Aim for full coverage of the trade
   state machine and permissions instead of a number across the whole app.
7. **Tests never touch real data.** Integration, E2E, and performance tests
   only run against the local test stack. The scripts refuse any other
   database.

## 2. Test layers

| Layer       | What it checks                                                     | Speed      | Runs                                         |
| ----------- | ------------------------------------------------------------------ | ---------- | -------------------------------------------- |
| Unit        | Pure functions: contracts, validation, error mapping, helpers      | Seconds    | Every pull request                           |
| Integration | Server functions and API routes against real Postgres and Auth     | ~20 s      | Every pull request                           |
| Security    | Row Level Security and permissions (part of integration)           | Seconds    | Every pull request                           |
| End to end  | Full user flows in a real browser on a phone-sized screen          | ~2 min     | Labeled pull requests, weekly, or by hand    |
| Performance | Response times and failure rate under load                         | ~2 min     | By hand only                                 |
| Manual      | Real phones, PWA install, Play Store build                         | Slow       | Before each release                          |

## 3. Tools

| Need                         | Tool                                          | Why                                                        |
| ---------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| Unit and integration tests   | Vitest (`vitest.config.mts`, two projects)    | Fast, TypeScript native, same runner for both              |
| Coverage                     | `@vitest/coverage-v8`                         | Shows which server code the unit tests never run           |
| Local test database          | Supabase CLI local stack (`supabase/`)        | Real Postgres, Auth, and a fake inbox (Mailpit) in Docker  |
| End to end                   | Playwright (`playwright.config.ts`)           | Real browser, phone viewport, recommended by Next.js       |
| Performance                  | Grafana k6 (`tests/performance/`)             | Scriptable load tests with pass/fail thresholds            |
| Lint and type check          | ESLint (`eslint.config.mjs`) and `tsc`        | Already part of the project, run in CI                     |

**Docker Desktop** must be running for integration, E2E, and performance
tests. k6 doesn't need to be installed: without it, `pnpm test:performance`
uses the `grafana/k6` Docker image.

### The local test stack

`pnpm db:test:start` (`scripts/test-db.mjs`):

1. Starts Supabase in Docker with the settings in `supabase/config.toml`:
   email confirmation on (like the hosted project), our real email templates
   from `emails/`, high rate limits for tests, and only the services tests use
   (Postgres, Auth, REST, Storage, Mailpit). If you started the stack before
   storage was added, run `pnpm db:test:stop` and `pnpm db:test:start` once.
2. Applies our Drizzle migrations to it, including the hobby seed.
3. Writes `.env.test.local` (git-ignored) with the local URLs and keys.

It only ever migrates a database on `127.0.0.1`. `drizzle.config.ts` doesn't
read `.env.local` when a database URL is already set, so the test script can't
be pointed at the dev project by accident.

| Local service   | Address                  |
| --------------- | ------------------------ |
| API (Auth, REST)| http://127.0.0.1:54321   |
| Postgres        | 127.0.0.1:54322          |
| Mailpit inbox   | http://127.0.0.1:54324   |
| App during E2E  | http://127.0.0.1:3100    |

Open http://127.0.0.1:54324 in a browser to see the emails tests sent.

## 4. Folder structure and naming

```
tests/
├── unit/                    no database, runs anywhere (pnpm test)
│   ├── server/              auth, users, http helpers
│   └── shared/              contracts and mock data
├── integration/             real database (pnpm test:integration)
│   ├── setup.ts             loads .env.test.local, refuses non-local URLs
│   ├── helpers.ts           test users, tokens, requests, cleanup
│   ├── auth/                sign up, profile trigger, verification, log in
│   ├── users/               /api/me, /api/users/:handle, /api/hobbies, audit log
│   └── security/            Row Level Security
├── e2e/                     Playwright (pnpm test:e2e)
│   ├── mailbox.ts           reads emails from Mailpit
│   └── auth.spec.ts         sign up, log in, forgot password
└── performance/
    └── api.js               k6 script (pnpm test:performance)
```

Planned folders as features arrive: `integration/trades/` (Phase 3),
`integration/items/` and `integration/posts/` (Phase 2), `factories/` once
trades need richer test data.

- Unit and integration files end in `.test.ts`. Playwright files end in `.spec.ts`.
- Test names describe behavior: `"refuses a handle someone already has"`,
  not `"test signup 2"`.

## 5. Commands

| Command                          | Runs                                                    | Needs Docker |
| -------------------------------- | ------------------------------------------------------- | ------------ |
| `pnpm lint`                      | ESLint                                                  | No           |
| `pnpm typecheck`                 | Route type generation and `tsc --noEmit`                | No           |
| `pnpm test`                      | Unit tests once                                         | No           |
| `pnpm test:watch`                | Unit tests, re-running on save                          | No           |
| `pnpm test:coverage`             | Unit tests with a coverage report (`coverage/`)         | No           |
| `pnpm db:test:start`             | Start the local stack, migrate, write `.env.test.local` | Yes          |
| `pnpm db:test:reset`             | Wipe the local database and migrate again               | Yes          |
| `pnpm db:test:stop`              | Stop the local stack                                    | Yes          |
| `pnpm test:integration`          | Integration and security tests                          | Yes          |
| `pnpm test:e2e`                  | Playwright: builds the app, starts it on port 3100      | Yes          |
| `pnpm test:e2e:ui`               | Playwright's visual runner, for writing and debugging   | Yes          |
| `pnpm test:performance`          | k6 load test (10 users, about 1 minute)                 | Yes          |
| `pnpm test:performance -- --smoke` | k6 quick check (1 user, 15 seconds)                   | Yes          |

Typical session:

```
pnpm db:test:start        # once, after starting Docker Desktop
pnpm test                 # while coding
pnpm test:integration     # before opening a pull request
pnpm test:e2e             # for big changes (section 8)
pnpm db:test:stop         # when done for the day
```

**`pnpm test:e2e` and `pnpm test:performance` build into `.next-test`**, not
`.next` (`NEXT_DIST_DIR` in `next.config.ts`). They're safe to run while
`pnpm dev` is open. An early version built into `.next` and broke the fonts of
a running dev server; if that ever happens, stop `pnpm dev`, delete `.next`,
and start it again.

## 6. Test data

- Integration and E2E tests create their own users with
  `createUser()` in `tests/integration/helpers.ts`. It creates the account
  the same way sign up does, so the profile trigger runs.
- Every test user has a random suffix (`it_login_3fa9c2d1`,
  `login.3fa9c2d1@example.test`), so tests never collide, and is deleted in
  `afterAll`.
- `pnpm db:test:reset` wipes everything if the local database gets messy.
- Use obvious fake values. Never use production data or production keys.
- For screens built before an endpoint exists, use `src/shared/mocks/`. It is
  checked against the contracts by `tests/unit/shared/mocks.test.ts`.

## 7. What must be tested

Status: ✅ done, ⏳ when the feature is built.

### 7.1 Trade state machine (required before Phase 3 endpoints merge)

✅ Rules: `tests/unit/server/trades/stateMachine.test.ts` runs this whole matrix,
written as data in `tests/unit/server/trades/matrix.ts`, against
`transitionTrade()`. ⏳ Database: run the same matrix against the `app.trade_*`
functions when they exist, so the rules in TypeScript and in Postgres can't drift.

Test every row of this matrix. "Maker" is the person who made the current
offer. "Responder" is the other person.

| From                           | Action                   | By maker           | By responder            | By outsider  |
| ------------------------------ | ------------------------ | ------------------ | ----------------------- | ------------ |
| pending                        | counter                  | Reject (403)       | Allow, stays pending    | Reject (403) |
| pending                        | accept                   | Reject (403)       | Allow, becomes accepted | Reject (403) |
| pending                        | decline                  | Reject (403)       | Allow, becomes declined | Reject (403) |
| pending                        | cancel                   | Allow              | Allow                   | Reject (403) |
| accepted                       | counter, accept, decline | Reject (409)       | Reject (409)            | Reject (403) |
| accepted                       | confirm complete         | Records their side | Records their side      | Reject (403) |
| accepted                       | both confirmed           | Becomes completed  |                         |              |
| accepted                       | cancel or no-show        | Allow, items freed | Allow, items freed      | Reject (403) |
| completed, declined, cancelled | any action               | Reject (409)       | Reject (409)            | Reject (403) |

Also test:

- Proposing requires a verified email (TRD-09).
- You cannot trade with yourself.
- You cannot offer items you do not own.
- You cannot ask for items that are not up for trade or not available.
- Both sides need at least one item; cash is only a top-up (TRD-01, decided
  2026-11-08). The contract side of this is already tested (✅).
- Cash amount must be positive whole pesos and `cash_from` must be set (✅ contract).
- A counter creates a new offer row and updates `current_offer_id` (TRD-03).
- Accepting reserves every item in the offer (TRD-06).
- Accepting cancels other pending trades that use any of those items (TRD-06).
- A no-show cancel frees items and creates a report (MEET-06).
- Completion needs both confirmations (MEET-05).

### 7.2 Concurrency (required with Phase 3) ⏳

These tests run two actions at the same time on separate database
connections and check that exactly one wins.

| Scenario                                                  | Expected                                         |
| --------------------------------------------------------- | ------------------------------------------------ |
| Responder accepts while maker cancels                     | One succeeds, the other gets 409                 |
| Responder accepts while also sending a counter (two tabs) | One succeeds, the other gets 409                 |
| Two different trades accept the same item at once         | One succeeds, the other gets 409 or is cancelled |
| Both people confirm completion at the same moment         | Trade ends completed exactly once                |

Example shape:

```ts
it("allows only one of accept and cancel to win", async () => {
  const { trade, maker, responder } = await createPendingTrade();

  const results = await Promise.allSettled([
    acceptTrade({ tradeId: trade.id, userId: responder.id }),
    cancelTrade({ tradeId: trade.id, userId: maker.id }),
  ]);

  const succeeded = results.filter((r) => r.status === "fulfilled");
  expect(succeeded).toHaveLength(1);

  const final = await getTrade(trade.id);
  expect(["accepted", "cancelled"]).toContain(final.status);
});
```

### 7.3 Permissions and security

- ✅ `GET /api/me` and `PATCH /api/me` return 401 when logged out.
- ✅ Unknown fields in request bodies are rejected.
- ✅ Report counts and private fields never appear in a public profile (PROF-07).
- ✅ Suspended accounts are hidden from public profiles.
- ⏳ Every new write endpoint returns 401 when logged out.
- ⏳ Users cannot edit or delete other users' posts or items.
- ⏳ Blocked users cannot message, propose trades, or see the blocker's posts (SAFE-02).
- ⏳ Suspended users cannot post, message, or trade.
- ⏳ Admin endpoints reject non-admins.

### 7.4 Row Level Security ✅ (extend with every new table)

`tests/integration/security/rls.test.ts` uses the public anon key, logged out
and logged in, exactly like a browser:

- ✅ No rows readable from `users`, `hobbies`, `user_hobbies`.
- ✅ No inserts into any of them.
- ✅ The private `app` schema (audit log) can't be reached.
- ⏳ Add every new table to `TABLES` in that file.
- ⏳ `messages`: a trade member can read that trade's messages; a non-member
  gets no rows (Phase 4).

### 7.5 Other areas

| Area             | Must test                                                            | Status |
| ---------------- | -------------------------------------------------------------------- | ------ |
| Auth             | Sign up creates the profile with terms and age times                 | ✅     |
| Auth             | A direct Supabase sign up without terms or age is refused            | ✅     |
| Auth             | Handle uniqueness at sign up and in Edit profile                     | ✅     |
| Auth             | Verification is copied to the profile; unverified log in is refused  | ✅     |
| Audit trail      | Profile edits record who made them                                   | ✅     |
| Items            | Reserved and traded items can't be edited or deleted (ITEM-04, ITEM-05) | ✅     |
| Items            | Reserved and traded items can't be offered in new trades            | ⏳ Phase 3 |
| Items            | An edit changes only the fields sent (no reset to defaults)          | ✅     |
| Photos           | A photo can only be attached once, and only by its owner             | ✅     |
| Posts            | "For trade" is derived from tagged items (POST-02); max 6 photos     | ✅     |
| Feed             | Cursor pagination returns no duplicates when new posts arrive        | ✅     |
| Feed             | Hidden posts and suspended authors are left out                      | ✅     |
| Images           | Uploaded photos have no EXIF or GPS data; wrong file types rejected  | ✅     |
| Images           | Profile photo upload, replace, and delete against real storage       | ✅     |
| Brand            | Logo files in `src/shared/brand.ts` exist and have the sizes written there | ✅ |
| Chat             | Contact info warning triggers on phone numbers (CHAT-04)             | ⏳     |
| Ratings          | One per rater per trade; hidden until both rate or 7 days pass       | ⏳     |
| Account deletion | Active trades cancelled, reserved items freed, data removed          | ⏳     |
| Validation       | Each Zod contract accepts valid data and rejects bad data            | ✅     |

## 8. End-to-end flows

Playwright runs the production build on a Pixel 7-sized screen against the
local stack. Emails land in Mailpit, and tests open the link from there.

| Flow                                                                       | Status |
| -------------------------------------------------------------------------- | ------ |
| 1. Sign up, verify email, land in onboarding; log in errors; forgot password | ✅ `tests/e2e/auth.spec.ts` |
| 2. Add an item and create a for-trade post                                 | ⏳ Phase 2 |
| 3. Full trade: propose, counter, accept, chat, meetup, both confirm, rate  | ⏳ Phase 4 |
| 4. Report a post and block a user                                          | ⏳ Phase 5 |
| 5. Delete an account                                                       | ⏳ Phase 5 |

**When E2E runs in CI.** Not on every pull request, because it adds a few
minutes. It runs when:

- a pull request has the **`e2e` label**. Add it for big changes: auth,
  trades, new user flows, or shared components many screens use.
- someone starts it by hand: GitHub > Actions > E2E > Run workflow.
- every Monday (scheduled), to catch anything that slipped through.

**Writing E2E tests.** Use `getByRole` and `getByLabel` with the visible
text, not CSS classes, so redesigns don't break tests. Each test creates its
own users. Don't add E2E tests for single buttons or styles; cover whole flows.

## 9. Performance

`tests/performance/api.js` loads the busiest read endpoints the way a visitor
uses them: `/api/hobbies`, `/api/users/:handle`, `/api/health`.

- **Where it runs:** a production build on this machine against the local
  stack (`pnpm test:performance`). Results are repeatable, and it never
  touches the dev project or Vercel limits.
- **Load:** 10 people browsing at once for about a minute (`--smoke`: 1
  person for 15 seconds).
- **Pass rules:** under 1% failed requests and p95 under 300 ms per endpoint
  (TRD section 16, Proposed).
- **First run (2026-11-09):** 591 requests, 0% failed, p95 between 6 and
  12 ms. Local numbers are much faster than Vercel plus the hosted database,
  so treat them as a regression baseline, not a production estimate.
- **Against a deployed preview** (light load only):
  `pnpm test:performance -- --smoke --url https://<preview>.vercel.app --handle <a real handle>`.
  The script refuses the production URL unless the team agrees first.
- **In CI:** only by hand (Actions > Performance > Run workflow). Never on
  every push.

Add an endpoint to the script when it becomes busy: the feed (Phase 2) and
trades list (Phase 3) are next.

## 10. CI

| Workflow                              | When                                    | Jobs                                                     |
| ------------------------------------- | --------------------------------------- | -------------------------------------------------------- |
| `.github/workflows/ci.yml`            | Every pull request and push to `main`   | `checks`: lint, type check, unit tests, build. `integration`: local stack, migrations, integration tests |
| `.github/workflows/e2e.yml`           | `e2e` label, by hand, Mondays           | Playwright against the local stack; uploads a report on failure |
| `.github/workflows/performance.yml`   | By hand only                            | k6 smoke or load test against the local stack            |

No workflow needs secrets: tests use the local stack, never the hosted
projects. Vercel deploys separately through its GitHub app.

**Blocking bad merges.** Branch protection on `main` is off (decided
2026-11-10), so GitHub does not stop a merge when a check fails. The rule is
on us: only merge a pull request when `checks` and `integration` are green.
A merge into `main` deploys to production.

## 11. Known limitations

- Integration tests call route handlers directly, not through a running
  server. `connection()` and `cookies()` are replaced with simple stand-ins in
  `tests/integration/setup.ts`. The real request pipeline is covered by E2E.
- Turnstile (CAPTCHA) is off in the local stack, so the real check isn't
  tested. E2E builds use Cloudflare's always-pass test site key
  (`playwright.config.ts`), so the widget loads on `127.0.0.1` without
  touching the real key. The hosted project enforces the real check.
- Supabase's hosted settings (email templates, SMTP, Site URL) are set in the
  dashboard and can't be tested locally. `supabase/config.toml` copies the
  parts tests rely on; keep them in step.
- Local performance numbers are much faster than production (section 9).
- `async` Server Components can't be unit tested with Vitest (Next.js docs);
  they're covered by E2E.

## 12. Regression testing

Regression testing means making sure a change doesn't break what already
worked. We don't keep a separate regression suite; the whole suite is the
regression suite:

1. **Every pull request** reruns all unit and integration tests (`ci.yml`).
   Wait for them to pass before merging (section 10).
2. **Big changes** get the `e2e` label, so the critical flows run in a real
   browser too. The Monday run catches what labels miss.
3. **Every bug fix adds a test** that fails without the fix. Put it next to
   the tests for that area and name it after the behavior, for example
   `"keeps the old handle when the new one is taken"`.
4. **Shared code needs a wider check.** A change in `src/shared/contracts/`,
   `src/server/http/`, `src/server/db/`, or a migration can affect every
   endpoint: run `pnpm test:integration` locally and add the `e2e` label.
5. **Never skip or delete a failing test to get green.** Fix the code, or fix
   the test with a comment explaining why the old expectation was wrong.

## 13. Manual release checklist

Run on real devices before every production release.

### Devices

- [ ] Mid-range Android phone, Chrome
- [ ] Android phone, installed Play Store build
- [ ] iPhone, Safari
- [ ] Desktop, Chrome and one other browser

### Checks

- [ ] Sign up and email arrives (check spam folder too)
- [ ] Feed loads quickly on mobile data
- [ ] Photo upload works from the camera and the gallery
- [ ] Full trade between two test accounts on two phones
- [ ] Chat updates in real time on both phones
- [ ] Push notification arrives (Android)
- [ ] Install as PWA from the browser
- [ ] Offline page appears with no connection
- [ ] Report, block, and delete account work
- [ ] Text is readable and buttons are easy to tap with one thumb
- [ ] No new errors in Sentry after testing

## 14. Play Store closed test

- Recruit at least 15 testers so the count stays at 12 or more for 14 days.
- Give testers a short list of things to try (the five flows in section 8).
- Collect feedback with one simple form using the bug report template below.
- Check Sentry and the feedback form daily during the test.
- Fix critical bugs during the test. Pushing updates does not reset the
  14-day count as long as testers stay opted in.

## 15. Bug report template

```
Title: short description

Steps to reproduce:
1.
2.
3.

Expected:
Actual:

Device and browser:
Account used (handle, never a password):
Screenshot or screen recording:
Severity: critical / major / minor
```

Severity guide:

- **Critical:** data loss, money or item mix-ups in trades, security or
  privacy leak, app unusable. Fix before release.
- **Major:** a main flow is broken but there is a workaround.
- **Minor:** visual issues, typos, small annoyances.

## 16. Definition of done for a pull request

- [ ] New logic in `src/server/` has tests
- [ ] Bug fixes include a test that fails without the fix
- [ ] New tables are added to the RLS test (section 7.4)
- [ ] All checks are green (`checks` and `integration`)
- [ ] Big changes have the `e2e` label and E2E passed
- [ ] Manually tested on a phone-sized screen if the UI changed
- [ ] Requirement IDs linked in the description
