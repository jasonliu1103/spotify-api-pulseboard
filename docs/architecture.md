# Architecture

## Goal

Build a full-stack Spotify analytics application that can:

- ingest user and playlist data on a schedule
- store historical snapshots in Postgres
- surface trends in a dashboard
- generate AI-curated playlists from prompts plus stored user taste signals

## High-Level Flow

1. A user signs in with Spotify OAuth.
2. The app stores the Spotify account link and refresh token securely.
3. A sync job fetches profile, ranking, library, and playlist data from Spotify.
4. The worker normalizes the response into Postgres tables and snapshot records.
5. The dashboard reads from Postgres instead of calling Spotify live for every view.
6. The AI layer reads structured taste data from Postgres, combines it with a prompt, and returns explainable playlist suggestions.

## System Components

### Next.js app

- Handles the web UI, auth entry points, dashboard routes, and playlist actions.
- Reads aggregated analytics from the database for fast page loads.
- Submits playlist-generation prompts to the AI workflow.

### Prisma data layer

- Defines the relational schema in code and generates the database client.
- Keeps Postgres access centralized instead of scattering SQL across the app.
- Makes it easier to evolve the schema as the analytics MVP grows.

### Sync worker

- Refreshes Spotify tokens when needed.
- Runs scheduled sync jobs and records job results.
- Retries transient failures and logs rate-limit issues.

### Postgres

- Stores normalized music entities like artists, albums, tracks, playlists, and user snapshot tables.
- Enables time-based analytics instead of one-off API responses.
- Makes it possible to compare changes across sync windows.

### AI recommendation layer

- Uses stored preferences, recently synced data, and natural-language intent.
- Produces playlist suggestions with short explanations for why tracks were selected.
- Optionally writes finished playlists back to Spotify.

## MVP Notes

- Prefer snapshot-based analytics first. It is simpler, easier to explain, and already strong enough for a portfolio project.
- Keep the initial dashboard focused: top artists, top tracks, genre mix, discovery rate, and repeat behavior.
- Add the AI layer only after the sync pipeline and stored analytics are working end to end.
