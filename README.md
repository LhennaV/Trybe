# Trybe

> Curiosity killed the cat. Trybe brought it back.

Trybe is a web app for trading hobby tools and equipment. Post photos of what you've made along with the tools you used, browse a feed by hobby, and propose trades on tagged items: item for item, or with a cash or item top-up when the values don't match.

Trust comes from ratings, trade history, account age, and a "new trader" badge. Trybe doesn't handle payments or shipping. Cash top-ups are agreed in the app and settled in person.

## Status

Early planning. No app code yet.

## Team

- **Lhenna**: design and frontend
- **Tristan**: backend

## Planned stack (not final yet)

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Vercel Serverless Functions (API routes in the same Next.js project)
- **Database, auth, and storage:** Supabase (PostgreSQL)
- **Real-time chat:** Supabase Realtime
- **Hosting:** Vercel
- **Bot protection:** Cloudflare Turnstile
- **Mobile:** installable PWA (no native app in v1)

This may change as we go.

## Branches

| Branch | Purpose |
|---|---|
| `main` | Stable, reviewed work |
| `front-end/fe` | Frontend work |
| `back-end/be` | Backend work |

Work happens on `front-end/fe` and `back-end/be`. When something is ready, open a pull request into `main` and have the other person review it before merging.
