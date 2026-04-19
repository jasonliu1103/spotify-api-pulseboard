# Pulseboard

Pulseboard is a full-stack Spotify analytics app built with Next.js, Prisma, and Postgres. It lets a user connect a Spotify account, sync listening data into a relational database, and explore a dashboard backed by stored snapshots instead of live Spotify calls on every page load.

## Current Status

The app is already functional and currently includes:

- Spotify OAuth login and logout
- HMAC-signed session cookie auth
- Manual + scheduled sync (Vercel Cron, every 30 min) for top artists, top tracks, saved tracks, playlists, and recently-played events
- Prisma-backed Postgres storage with normalized entity tables, historical snapshots, and an event stream for recent plays
- A dashboard with top artists, top tracks, recently played, recent saves, playlists, a live now-playing card, and sync status (per-step counts)
- "Last 7 days" window on the dashboard sourced from the recently-played event stream
- Light and dark theme persistence across the app
- Early AI playlist request scaffolding in the data model and server layer

Still planned:

- Repeat-rate and discovery analytics (needs a few days of event history first)
- Delta indicators on dashboard tiles vs the prior period
- User-facing AI playlist generation flow
- Spotlight tile views — click a tile to zoom into a focused overview at `/dashboard/[tile]`
- Reactive ambient wave for the now-playing card
- Grid-pattern background with a cursor-reactive ripple on the landing page
- Deployment hardening (prisma migrations baseline, token encryption)

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma
- PostgreSQL
- Tailwind CSS v4
- Spotify Web API

## How It Works

1. A user starts OAuth at `/api/auth/spotify`.
2. The callback exchanges the code for Spotify tokens, upserts the user and Spotify account, and sets a signed session cookie.
3. The dashboard reads analytics from Postgres through server-side query functions.
4. Sync runs either manually (`POST /api/sync` from the dashboard) or on a schedule (`GET /api/cron/sync`, triggered by Vercel Cron every 30 min per `vercel.json`).
5. The sync pipeline fetches Spotify data, normalizes artists, albums, tracks, playlists, writes snapshot rows, and appends new rows to `RecentlyPlayedEvent`. Per-step counts are recorded on the `SyncRun`.
6. The now-playing card on the dashboard polls `GET /api/now-playing` every 15s for the live track.

## Project Structure

```text
src/
  app/
    api/auth/       OAuth start + callback, logout
    api/sync/       Manual sync trigger (POST)
    api/cron/sync/  Scheduled sync entry point for Vercel Cron (GET)
    api/now-playing/ Live currently-playing endpoint for the dashboard
    dashboard/      Server-rendered analytics dashboard
  components/   UI components for auth, dashboard, marketing, and theme toggle
  jobs/         Data-ingestion and sync workflows
  lib/          Shared infrastructure: Prisma, Spotify client, origin helpers, utils
  server/       Server-side domain logic for auth, analytics, and playlist workflows
  types/        Shared TypeScript types
prisma/
  schema.prisma Database schema
docs/
  architecture.md
  roadmap.md
  schema.md
scripts/
  dev.mjs       Starts Next.js on the configured host and port
middleware.ts   Canonical-origin redirect handling
vercel.json     Vercel Cron schedule
```

Key entry points:

- [src/app/layout.tsx](src/app/layout.tsx) sets up the shared app shell and theme bootstrap
- [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx) renders the main analytics dashboard
- [src/jobs/sync-spotify.ts](src/jobs/sync-spotify.ts) handles Spotify ingestion and snapshot writes
- [src/server/analytics/overview.ts](src/server/analytics/overview.ts) powers the dashboard read model
- [src/server/auth/spotify.ts](src/server/auth/spotify.ts) manages Spotify OAuth and token refresh
- [prisma/schema.prisma](prisma/schema.prisma) defines the relational data model

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in the required values.

3. Create a local Postgres database named `pulseboard`.

4. Push the Prisma schema:

```bash
npm run db:push
```

5. Start the dev server:

```bash
npm run dev
```

By default the app runs at `http://127.0.0.1:3000`.

If you prefer `http://localhost:3000`, update both `NEXT_PUBLIC_APP_URL` and `SPOTIFY_REDIRECT_URI` to use `localhost` so the app and OAuth callback stay on the same origin.

`npm install` also runs `prisma generate` automatically.

## Environment Variables

Required for the current app:

- `NEXT_PUBLIC_APP_URL`: canonical app origin used for local routing consistency
- `SPOTIFY_CLIENT_ID`: Spotify app client ID
- `SPOTIFY_CLIENT_SECRET`: Spotify app client secret
- `SPOTIFY_REDIRECT_URI`: Spotify OAuth callback URL
- `DATABASE_URL`: Postgres connection string
- `SESSION_SECRET`: secret used to sign the session cookie

Required when the Vercel Cron is enabled:

- `CRON_SECRET`: bearer token Vercel sends with scheduled requests to `/api/cron/sync`

Reserved for upcoming work:

- `OPENAI_API_KEY`

## Scripts

- `npm run dev` starts the development server
- `npm run build` creates a production build
- `npm run start` runs the production server
- `npm run lint` runs ESLint
- `npm run typecheck` runs the TypeScript compiler without emitting files
- `npm run db:format` formats the Prisma schema
- `npm run db:generate` generates the Prisma client
- `npm run db:push` pushes the Prisma schema to Postgres
- `npm run db:studio` opens Prisma Studio

## Known Limitations

- Playlist `/items` requests can return `403` in Spotify Dev Mode. The sync job skips those playlist-item fetches and continues.
- Spotify no longer populates `genres[]` on artist responses for Developer Mode apps, so the original genre-mix tile was removed in favor of a recently-played list. Artist rows still have the `genres` column; it's just usually empty.
- Access and refresh tokens are currently stored plaintext in Postgres. Encrypt them before any shared deployment.
- There is no baseline Prisma migration history yet; the schema is currently applied with `db push`. Establish a baseline migration before relying on the scheduled cron in production.
- Repeat-rate and discovery analytics need more snapshot + event history and are not implemented yet.
- Vercel Cron only fires in production deployments; locally the scheduled sync does not run — use the manual "Sync now" button.

## Docs

- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Schema Notes](docs/schema.md)
