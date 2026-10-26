# Trybe Testing Guide

|              |                                                                              |
| ------------ | ---------------------------------------------------------------------------- |
| Version      | 0.1                                                                          |
| Last updated | 2026-10-26                                                                   |
| Related      | `docs/technical-requirements.md` (section 18), `docs/implementation-plan.md` |

This guide explains what we test, how, and when. Tool choices marked
**Proposed** still need team sign-off.

## 1. Principles

1. **Test the rules, not the pixels.** Most tests target `src/server/`,
   where the business rules live. UI is checked mostly by end-to-end and
   manual tests.
2. **Trade logic is never merged without tests.** It is the part most likely
   to break trust if it goes wrong.
3. **Test against real Postgres.** Locking, constraints, and Row Level
   Security only behave correctly on a real database. No fake databases for
   trade or security tests.
4. **Every bug gets a test.** When a bug is fixed, add a test that would have
   caught it.
5. **Tests run on every pull request.** A failing test blocks the merge.
6. **No coverage percentage target.** Aim for full coverage of the trade
   state machine and permissions instead of a number across the whole app.

## 2. Test layers

| Layer       | What it checks                                                | Speed     | Who writes it | Runs                                           |
| ----------- | ------------------------------------------------------------- | --------- | ------------- | ---------------------------------------------- |
| Unit        | Pure functions: validation, state machine rules, helpers      | Very fast | Tristan       | Every pull request                             |
| Integration | Server functions and API routes against a real local database | Medium    | Tristan       | Every pull request                             |
| Security    | Row Level Security and permission checks                      | Medium    | Tristan       | Every pull request                             |
| End to end  | Full user flows in a real browser                             | Slow      | Both          | Before merging big features and before release |
| Manual      | Real phones, PWA install, Play Store build                    | Slow      | Both          | Before each release                            |

## 3. Tools (Proposed)

| Need                              | Tool                                                              |
| --------------------------------- | ----------------------------------------------------------------- |
| Unit and integration tests        | Vitest                                                            |
| Local database for tests          | Supabase CLI local stack (runs Postgres, Auth, Storage in Docker) |
| End to end                        | Playwright                                                        |
| Component tests (optional, later) | React Testing Library with Vitest                                 |

Docker Desktop is needed on Windows for the Supabase local stack.

## 4. Folder structure and naming

```
tests/
├── unit/
│   └── trades/
│       └── state-machine.test.ts
├── integration/
│   ├── trades/
│   │   ├── propose.test.ts
│   │   ├── accept.test.ts
│   │   └── concurrency.test.ts
│   ├── items/
│   └── posts/
├── security/
│   ├── rls-messages.test.ts
│   └── permissions.test.ts
├── e2e/
│   ├── signup.spec.ts
│   └── full-trade.spec.ts
├── factories/          builders for test users, items, posts, trades
└── setup/              database reset and shared setup
```

- Unit and integration files end in `.test.ts`.
- Playwright files end in `.spec.ts`.
- Test names describe behavior: `"rejects accept from the person who made the offer"`,
  not `"test accept 2"`.

## 5. Commands (Proposed)

Add these scripts to `package.json` when the tools are installed:

| Command              | Runs                                          |
| -------------------- | --------------------------------------------- |
| `pnpm test`          | Unit, integration, and security tests once    |
| `pnpm test:watch`    | Same, re-running on save                      |
| `pnpm test:unit`     | Unit tests only                               |
| `pnpm test:e2e`      | Playwright tests                              |
| `pnpm db:test:start` | Start the Supabase local stack                |
| `pnpm db:test:reset` | Reset the local database and apply migrations |

## 6. Test data

- Use **factories** in `tests/factories/` to create test data:
  `createUser()`, `createItem({ ownerId })`, `createTrade({ ... })`.
  Factories fill in sensible defaults so each test only sets what it cares
  about.
- Reset the database between test files so tests never depend on each other.
- Never use production data or production keys in tests.
- Use obvious fake values: `tester1@example.com`, handle `test_kiln`.

## 7. What must be tested

### 7.1 Trade state machine (required before Phase 3 endpoints merge)

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
- Cash amount must be positive and `cash_from` must be set when there is cash.
- A counter creates a new offer row and updates `current_offer_id` (TRD-03).
- Accepting reserves every item in the offer (TRD-06).
- Accepting cancels other pending trades that use any of those items (TRD-06).
- A no-show cancel frees items and creates a report (MEET-06).
- Completion needs both confirmations (MEET-05).

### 7.2 Concurrency (required)

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

### 7.3 Permissions and security (required)

- Every write endpoint returns 401 when logged out.
- Users cannot edit or delete other users' posts, items, or profiles.
- Blocked users cannot message, propose trades, or see the blocker's posts
  (SAFE-02).
- Suspended users cannot post, message, or trade.
- Report counts never appear in any public API response (PROF-07).
- Admin endpoints reject non-admins.
- Unknown fields in request bodies are rejected.

### 7.4 Row Level Security (required)

Run these with the Supabase client as different users, not as the service
role:

- A trade member can read that trade's messages.
- A non-member gets no rows from that trade's messages.
- An anonymous client gets no rows from private tables.
- The browser cannot insert or update rows directly in any table.

### 7.5 Other areas

| Area             | Must test                                                            |
| ---------------- | -------------------------------------------------------------------- |
| Auth             | Unverified users blocked from posting and trading; handle uniqueness |
| Items            | Reserved and traded items cannot be edited into new trades           |
| Posts            | "For trade" is derived from tagged items (POST-02); max 6 photos     |
| Feed             | Cursor pagination returns no duplicates when new posts arrive        |
| Images           | Uploaded photos have no EXIF or GPS data; wrong file types rejected  |
| Chat             | Contact info warning triggers on phone numbers (CHAT-04)             |
| Ratings          | One per rater per trade; hidden until both rate or 7 days pass       |
| Account deletion | Active trades cancelled, reserved items freed, data removed          |
| Validation       | Each Zod contract accepts valid data and rejects bad data            |

## 8. End-to-end flows

Write Playwright tests for these critical paths, on a phone-sized viewport:

1. Sign up, verify email, onboard with hobbies
2. Add an item and create a for-trade post
3. Full trade: propose, counter, accept, chat, set meetup, both confirm, both rate
4. Report a post and block a user
5. Delete an account

## 9. Manual release checklist

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

## 10. Play Store closed test

- Recruit at least 15 testers so the count stays at 12 or more for 14 days.
- Give testers a short list of things to try (the five flows in section 8).
- Collect feedback with one simple form using the bug report template below.
- Check Sentry and the feedback form daily during the test.
- Fix critical bugs during the test. Pushing updates does not reset the
  14-day count as long as testers stay opted in.

## 11. Bug report template

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

## 12. Pull request checks

These run automatically on every pull request and must pass to merge:

1. Lint
2. Type check
3. Unit, integration, and security tests
4. Build

End-to-end tests run before merging large features and before release,
because they are slow.

## 13. Definition of done for a pull request

- [ ] New logic in `src/server/` has tests
- [ ] Bug fixes include a test that fails without the fix
- [ ] All checks are green
- [ ] Manually tested on a phone-sized screen if the UI changed
- [ ] Requirement IDs linked in the description
