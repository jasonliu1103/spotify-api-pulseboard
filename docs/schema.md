# Schema Draft

The schema now lives in [prisma/schema.prisma](../prisma/schema.prisma). The design is centered on one idea: keep stable Spotify entities in core tables, then add snapshot tables anywhere we care about trends over time.

## Core identity tables

### `User`

Stores the app user profile and acts as the parent for Spotify account links, playlists, snapshots, sync runs, and AI requests.

### `SpotifyAccount`

Stores the connected Spotify identity and token metadata:

- `spotifyUserId`
- `accessToken`
- `refreshToken`
- `tokenExpiresAt`
- `country`
- `product`

This is kept separate from `User` so app identity and Spotify identity do not get mixed together.

## Music catalog tables

### `Artist`

Stable artist data from Spotify:

- `spotifyArtistId`
- `name`
- `genres`
- `imageUrl`
- `popularity`

### `Album`

Stable album data:

- `spotifyAlbumId`
- `name`
- `releaseDate`
- `imageUrl`

### `Track`

Stable track data:

- `spotifyTrackId`
- `albumId`
- `name`
- `durationMs`
- `previewUrl`
- `explicit`
- `popularity`

### `TrackArtist`

Join table for the many-to-many relationship between tracks and artists. `position` preserves credited order.

## Historical analytics tables

### `UserTopArtistSnapshot`

Stores artist rankings for a given user, time range, and sync timestamp.

Key fields:

- `userId`
- `artistId`
- `timeRange`
- `rank`
- `snapshotAt`

### `UserTopTrackSnapshot`

Same idea as artist snapshots, but for tracks.

These two snapshot tables are what make trend charts and “how did my taste change?” questions possible.

## Playlist tables

### `Playlist`

Stores the stable playlist identity and latest known metadata:

- `spotifyPlaylistId`
- `userId`
- `name`
- `description`
- `isPublic`
- `trackCount`

### `PlaylistSnapshot`

Captures a playlist’s metadata at a point in time.

### `PlaylistTrackSnapshot`

Captures the tracks inside a specific playlist snapshot, including ordering and `addedAt`.

This split is deliberate. It lets us answer questions like:

- how often does a playlist change
- which tracks tend to stick
- which playlists are growing over time

## User-library table

### `SavedTrack`

Stores a user’s saved tracks with `savedAt`. This supports discovery and retention-style metrics.

## Operational tables

### `SyncRun`

Tracks background job execution:

- `jobName`
- `status`
- `startedAt`
- `finishedAt`
- `recordsWritten`
- `errorMessage`

This makes ingestion observable instead of opaque.

### `AiPlaylistRequest`

Tracks AI playlist requests:

- `prompt`
- `status`
- `model`
- `createdAt`
- `completedAt`

This keeps the future AI workflow debuggable and measurable.

## Why this shape

This schema is built for the MVP, not for perfect Spotify coverage.

The intent is:

- normalized core tables for reusable entities
- snapshot tables for historical analytics
- operational tables for sync and AI observability

That gives you a clean base for dashboards now and leaves room for richer recommendation logic later.
