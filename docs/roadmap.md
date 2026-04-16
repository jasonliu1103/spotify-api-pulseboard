# Roadmap

## Phase 0: Starter

- [x] Create a `Next.js + TypeScript` project
- [x] Replace the default starter page with a portfolio-ready product page
- [x] Add project docs for architecture, roadmap, and schema design
- [x] Add an environment template for future integrations
- [x] Reorganize the repo into app, server, jobs, lib, and Prisma layers
- [x] Add Prisma and a first Postgres schema foundation

## Phase 1: Authentication and Data Ingestion

- [ ] Add Spotify OAuth login
- [ ] Store user account and token metadata
- [ ] Implement token refresh
- [ ] Sync profile, top artists, top tracks, and playlists
- [ ] Add job logging and error handling

## Phase 2: Database and Analytics

- [ ] Add the relational schema and migrations
- [ ] Store historical snapshots of ranked and playlist data
- [ ] Build queries for top artists, top tracks, genre mix, repeat rate, and discovery rate
- [ ] Create a first dashboard page with filters and time windows

## Phase 3: AI Playlist Generation

- [ ] Add a prompt input workflow
- [ ] Combine prompt intent with stored user preferences
- [ ] Return explainable track suggestions
- [ ] Save generated playlists back to Spotify

## Phase 4: Portfolio Polish

- [ ] Improve loading states and empty states
- [ ] Add screenshots and an architecture diagram to the README
- [ ] Deploy the app
- [ ] Record a short demo video
