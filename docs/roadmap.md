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

### Known limitations carried forward
- Playlist `/items` fetches return 403 under Spotify Dev Mode; handler counts and skips. Resolved only by Extended Quota Mode approval.
- Access/refresh tokens stored plaintext in Postgres — encrypt at rest before any shared deployment.
- No `prisma migrate` history yet (schema pushed via `db push`). Establish a baseline migration before Phase 4 deploy.
- Logout route and sync route redirects still use `request.url`; should adopt the shared `originFromRequest` pattern from the callback route.

## Phase 2: Database and Analytics

- [x] Add the relational schema (users, accounts, artists, albums, tracks, playlists, snapshots, saved tracks, sync runs)
- [x] Store historical snapshots of ranked and playlist data (`UserTopArtistSnapshot`, `UserTopTrackSnapshot`, `PlaylistSnapshot`, `PlaylistTrackSnapshot`)
- [ ] Build queries for top artists, top tracks, genre mix, repeat rate, and discovery rate
- [ ] Create a first dashboard page with filters and time windows

## Phase 3: Analytics Dashboard (next)

Render the data already being synced. No new Spotify calls required for the MVP.

- [ ] Top artists view with short/medium/long time-range toggle
- [ ] Top tracks view with the same time-range toggle
- [ ] Genre mix breakdown aggregated from artist genres
- [ ] Saved tracks count + recent saves list
- [ ] Playlist list (names, track counts, public/private)
- [ ] Sync status card (last run, records written, errors)
- [ ] Read via Prisma in server components in `src/app/dashboard/`

## Phase 4: AI Playlist Generation

- [ ] Prompt input workflow
- [ ] Combine prompt intent with stored user preferences
- [ ] Return explainable track suggestions
- [ ] Save generated playlists back to Spotify
- [ ] Fix hallucinated model names in `src/lib/ai/models.ts` before wiring

## Phase 5: Portfolio Polish

- [ ] Improve loading and empty states
- [ ] Add screenshots and an architecture diagram to the README
- [ ] Deploy the app (encrypt tokens, baseline prisma migrations first)
- [ ] Record a short demo video
