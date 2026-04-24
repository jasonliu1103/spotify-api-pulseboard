# Roadmap

## Phase 0: Starter

- [x] Create a `Next.js + TypeScript` project
- [x] Replace the default starter page with a portfolio-ready product page
- [x] Add project docs for architecture, roadmap, and schema design
- [x] Add an environment template for future integrations
- [x] Reorganize the repo into app, server, jobs, lib, and Prisma layers
- [x] Add Prisma and a first Postgres schema foundation

## Phase 1: Authentication and Data Ingestion

- [x] Add Spotify OAuth login (authorize + callback routes, HMAC-signed session cookie)
- [x] Store user account and token metadata (`SpotifyAccount` model)
- [x] Implement token refresh (`getValidAccessToken` in `src/server/auth/spotify.ts`)
- [x] Sync profile, top artists, top tracks, and playlists (`src/jobs/sync-spotify.ts`)
- [x] Add job logging and error handling (`SyncRun` rows, per-step error capture)
- [x] Canonical-origin middleware to prevent cookie drift between `localhost` and `127.0.0.1`

### Known limitations carried forward
- Playlist `/items` fetches return 403 under Spotify Dev Mode; handler counts and skips. Resolved only by Extended Quota Mode approval.
- Access/refresh tokens stored plaintext in Postgres — fine for single-user portfolio; must encrypt at rest before multi-user deploy.

## Phase 2: Database and Analytics

- [x] Add the relational schema (users, accounts, artists, albums, tracks, playlists, snapshots, saved tracks, sync runs)
- [x] Store historical snapshots of ranked and playlist data (`UserTopArtistSnapshot`, `UserTopTrackSnapshot`, `PlaylistSnapshot`, `PlaylistTrackSnapshot`)
- [x] Build queries for top artists, top tracks, genre mix (`src/server/analytics/overview.ts`)
- [x] Create a first dashboard page with filters and time windows (`src/app/dashboard/page.tsx`)

## Phase 3: Analytics Dashboard

- [x] Top artists view with short/medium/long time-range toggle
- [x] Top tracks view with the same time-range toggle
- [x] Recent saves list
- [x] Recently played list (sourced from ingested events)
- [x] Playlist list (names, track counts, public/private)
- [x] Sync status card (last run, records written, per-step counts, errors)
- [x] Dark mode with cookie-backed SSR persistence
- [~] ~~Genre mix breakdown~~ — removed: Spotify stopped populating `genres[]` on artist responses for Developer Mode apps, so the tile had no data to render

## Phase 4: Scheduled Sync + Event-Based History

Foundation for everything downstream. Spotify's top-items API only exposes ~4w / 6m / 1y windows — a real 7-day view and meaningful repeat/discovery analytics need a separate event stream.

- [x] Add `RecentlyPlayedEvent` table (`userId`, `trackId`, `playedAt`, `contextType`, `contextUri`, unique on `(userId, playedAt, trackId)`)
- [x] Build recently-played ingestion job against `/me/player/recently-played` (cursor-based, 50 items per call, dedupe via `createMany({ skipDuplicates: true })`)
- [x] Wire Vercel Cron to run top-items snapshot + recently-played ingestion on a schedule (every 30 min via `/api/cron/sync`)
- [x] Extend `SyncRun` with per-job counts (`stepCounts` JSON) so the sync-status card can report each stream separately
- [x] Baseline `prisma migrate` (`prisma/migrations/0_init/migration.sql`, marked applied via `migrate resolve`); added `db:migrate` / `db:deploy` scripts

## Phase 5: Event-Driven Analytics

Unlocks once Phase 4 has seeded at least a few days of event history.

- [x] Add "Last 7 days" option to `TimeRangeTabs`, sourced from `RecentlyPlayedEvent` rather than top-items snapshots
- [ ] Repeat rate (share of plays for tracks heard in a prior window)
- [ ] Discovery rate (new artists / tracks vs prior window)
- [ ] Delta indicators on existing tiles (vs previous period)

## Phase 6: Spotlight Tile Views

Turn the "Listening pulse" mock into the zoomed state for every dashboard tile.

- [ ] Route-based detail views at `/dashboard/[tile]` — shareable URLs, back-button friendly
- [ ] One hero chart on the left, 2-3 supporting insights on the right (matches the mock's layout)
- [ ] Smooth overview → spotlight transition (layout animation)
- [ ] Per-tile interpretation copy and delta vs prior period

## Phase 7: AI Playlist Generation

Move here from the original Phase 4 — the analytics need to feel trustworthy first.

- [ ] Prompt input workflow: prompt → taste summary → candidate preview with "why this fits" → create
- [ ] Combine prompt intent with stored user preferences and recent listening
- [ ] Return explainable track suggestions (one-line rationale per track)
- [ ] Save generated playlists back to Spotify
- [ ] Fix hallucinated model names in `src/lib/ai/models.ts` before wiring

## Phase 8: Live Listening

- [x] Add `user-read-currently-playing` scope in `src/lib/spotify/scopes.ts`
- [x] Now-playing card: track, artists, play/pause state, progress bar (polls `/api/now-playing` every 15s, ticks locally between polls)
- [ ] Add `user-read-playback-state` scope and surface device + playback context (playlist / album / radio)
- [ ] Subtle "LIVE" pill in the dashboard top-right when playback is active
- [ ] Reactive ambient wave — responds to play/pause, tempo bucket, energy level. **Not** beat-synced: Spotify's developer terms restrict synchronized visual output, and a loose ambient reaction is more robust from stored data anyway
- [ ] Polling backoff (pause polling when tab is hidden; slow down when paused)

## Phase 9: Portfolio Polish & Deployment

- [ ] Grid-pattern background with cursor-reactive ripple on the landing page
- [ ] Improve loading and empty states across the dashboard
- [ ] Screenshots + architecture diagram in the README
- [ ] Deploy (establish prisma migrations baseline, encrypt tokens if going multi-user)
- [ ] Short demo video
