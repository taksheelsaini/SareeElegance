# SareeElegance

Premium full‑stack e‑commerce platform for luxury Indian sarees.

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Wouter, Tailwind CSS, Radix UI (shadcn components), TanStack Query
- Backend: Express, TypeScript, Drizzle ORM, Neon (Postgres serverless), Passport (OIDC sessions)
- Auth: Replit OIDC (session + refresh handling)
- Styling: Tailwind design tokens + custom feminine palette
- Build: Vite (client) + esbuild (server bundle)

## Features

- Product catalog with filtering (price, fabric, occasion, color, sort)
- Categories, featured/new/sale product collections
- Product detail with images & reviews
- Cart & wishlist (session authenticated)
- Orders schema prepared (endpoints for create pending)
- Review system (write + fetch)

## Directory Structure

```text
client/          React UI
server/          Express API + auth + storage
shared/          Drizzle schema & shared types
attached_assets/ Static/media assets
drizzle.config.ts Drizzle kit config
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend (Express) and rely on Vite dev (in dev mode) |
| `npm run build` | Build client + bundle server to `dist/` |
| `npm start` | Run production build |
| `npm run db:push` | Apply Drizzle schema to database |
| `npm run check` | Type check |

## Environment Variables

Required:

- `DATABASE_URL` (Neon / Postgres connection)
- `SESSION_SECRET` (session signing)
- `REPL_ID` (Replit project id for OIDC)
- `REPLIT_DOMAINS` (comma‑separated domains used for callbacks)
- `ISSUER_URL` (optional override; defaults to Replit OIDC issuer)

## Development

Install deps:

```bash
npm install
```

Run dev:

```bash
npm run dev
```

(Ensure Postgres accessible + env vars set.)

## Roadmap (Planned Improvements)

- Order creation & checkout flow
- Stock validation & decrement
- Review aggregate updates (rating, count)
- Input validation middleware for query params
- CSRF protection & security headers
- Index optimization & migrations
- Test suite (unit + integration + e2e)

## License

MIT

---
Generated baseline README. Expand as the project evolves.
