# Trybe

> Curiosity killed the cat. Trybe brought it back.

Trybe is a mobile-first app for trading hobby tools and equipment. Post photos of what you've made along with the tools you used, browse a feed by hobby, and propose trades on tagged items: item for item, or with a cash or item top-up when the values don't match.

Trust comes from ratings, trade history, account age, email verification, and a "new trader" badge. Trybe doesn't handle payments or shipping. Cash top-ups are agreed in the app and settled in person.

## Status

Phase 0 (foundation). The screens are built on sample data. The backend (database, auth, API) is being set up. See [the implementation plan](docs/implementation-plan.md).

## Team

- **Lhenna**: design and frontend
- **Tristan**: backend

## Stack

- **App:** Next.js 16 (App Router, `src/`), React 19, TypeScript (strict), Tailwind CSS 4
- **Database:** PostgreSQL on Supabase, Drizzle ORM and migrations
- **Validation:** Zod, schemas shared by client and server in `src/shared/`
- **Auth, storage, realtime chat:** Supabase
- **Errors:** Sentry
- **Bot protection:** Cloudflare Turnstile
- **Tests:** Vitest
- **Hosting:** Vercel. Installable PWA, packaged for Google Play.

Full details are in [the technical requirements](docs/technical-requirements.md).

## Setup

You need Node.js 22.13 or newer and pnpm. **Use pnpm only.** Never npm or yarn, and never commit `package-lock.json`.

```bash
corepack enable          # gives you the pnpm version pinned in package.json
pnpm install
cp .env.example .env.local
```

Fill in `.env.local` with the Supabase dev project values (ask Tristan). The app runs without them, but anything that touches the database won't.

```bash
pnpm dev                 # http://localhost:3000
```

Check the database connection at <http://localhost:3000/api/health>.

## Commands

| Command            | Does                                                         |
| ------------------ | ------------------------------------------------------------ |
| `pnpm dev`         | Start the dev server                                         |
| `pnpm build`       | Production build                                             |
| `pnpm lint`        | Lint                                                         |
| `pnpm typecheck`   | Generate route types and type check                          |
| `pnpm test`        | Run all tests once                                           |
| `pnpm test:watch`  | Run tests on save                                            |
| `pnpm db:generate` | Create a migration from changes to `src/server/db/schema.ts` |
| `pnpm db:migrate`  | Apply migrations to the database in `DIRECT_DATABASE_URL`    |
| `pnpm db:studio`   | Browse the database in Drizzle Studio                        |

For SQL that Drizzle can't generate (functions, triggers, RLS policies), create an empty migration with `pnpm db:generate --custom --name=<what_it_does>` and write the SQL in it. Never edit a migration that has already been applied.

## Project structure

```
src/
├── app/            pages and layouts                 Lhenna
│   └── api/        REST route handlers (thin)        Tristan
├── components/     UI components                     Lhenna
├── server/         business logic, database          Tristan
└── shared/         Zod schemas and API contracts     Both
tests/              backend tests                     Tristan
docs/               technical docs
```

Read [AGENTS.md](AGENTS.md) before writing code. It has the architecture rules, trade rules, and safety requirements.

## Branches

- `main` is stable, reviewed work. Never push to it directly.
- Each person has one working branch: Lhenna on `frontend`, Tristan on `backend`.
- Open a pull request from your branch into `main`. Lint, type check, tests, and build must pass, and the other person reviews it.
- After it merges, update your branch from `main` and keep working on it.

## Docs

- [AGENTS.md](AGENTS.md): short guide for people and AI tools
- [Technical requirements](docs/technical-requirements.md)
- [Implementation plan](docs/implementation-plan.md)
- [Database design](docs/database.md)
- [Testing guide](docs/testing.md)
- [Design guide](src/styles/DESIGN.md)
