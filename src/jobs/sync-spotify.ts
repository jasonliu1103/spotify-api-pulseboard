import { SpotifyTimeRange, SyncRunStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { SpotifyApiError, spotifyFetch, spotifyFetchAll } from "@/lib/spotify/client";
import { getValidAccessToken } from "@/server/auth/spotify";

const SAVED_TRACKS_CAP = 500;
const TOP_ITEMS_LIMIT = 50;

const TIME_RANGES: { api: string; db: SpotifyTimeRange }[] = [
  { api: "short_term", db: SpotifyTimeRange.SHORT_TERM },
  { api: "medium_term", db: SpotifyTimeRange.MEDIUM_TERM },
  { api: "long_term", db: SpotifyTimeRange.LONG_TERM },
];

interface StartSyncRunInput {
  jobName: string;
  userId?: string;
}

export function startSyncRun({ jobName, userId }: StartSyncRunInput) {
  return prisma.syncRun.create({
    data: { jobName, userId, status: SyncRunStatus.RUNNING },
  });
}

export function finishSyncRun(runId: string, recordsWritten: number) {
  return prisma.syncRun.update({
    where: { id: runId },
    data: {
      status: SyncRunStatus.SUCCEEDED,
      finishedAt: new Date(),
      recordsWritten,
    },
  });
}

export function failSyncRun(runId: string, errorMessage: string) {
  return prisma.syncRun.update({
    where: { id: runId },
    data: {
      status: SyncRunStatus.FAILED,
      finishedAt: new Date(),
      errorMessage,
    },
  });
}

interface SpotifyImage {
  url: string;
}
interface SpotifyArtistLite {
  id: string;
  name: string;
}
interface SpotifyArtistFull extends SpotifyArtistLite {
  genres?: string[];
  images?: SpotifyImage[];
  popularity?: number;
}
interface SpotifyAlbum {
  id: string;
  name: string;
  release_date?: string;
  images?: SpotifyImage[];
}
interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  preview_url: string | null;
  explicit: boolean;
  popularity?: number;
  album?: SpotifyAlbum;
  artists: SpotifyArtistLite[];
}
interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string | null;
  public: boolean | null;
  tracks?: { total: number };
  items?: { total: number };
}
interface SpotifySavedTrack {
  added_at: string;
  track: SpotifyTrack | null;
}
interface SpotifyPlaylistTrackItem {
  added_at: string | null;
  track: SpotifyTrack | null;
}

async function upsertArtist(artist: SpotifyArtistFull | SpotifyArtistLite) {
  const full = artist as SpotifyArtistFull;
  return prisma.artist.upsert({
    where: { spotifyArtistId: artist.id },
    update: {
      name: artist.name,
      genres: full.genres ?? [],
      imageUrl: full.images?.[0]?.url ?? null,
      popularity: full.popularity ?? null,
    },
    create: {
      spotifyArtistId: artist.id,
      name: artist.name,
      genres: full.genres ?? [],
      imageUrl: full.images?.[0]?.url ?? null,
      popularity: full.popularity ?? null,
    },
  });
}

async function upsertAlbum(album: SpotifyAlbum) {
  return prisma.album.upsert({
    where: { spotifyAlbumId: album.id },
    update: {
      name: album.name,
      releaseDate: album.release_date ?? null,
      imageUrl: album.images?.[0]?.url ?? null,
    },
    create: {
      spotifyAlbumId: album.id,
      name: album.name,
      releaseDate: album.release_date ?? null,
      imageUrl: album.images?.[0]?.url ?? null,
    },
  });
}

async function upsertTrack(track: SpotifyTrack) {
  const albumId = track.album ? (await upsertAlbum(track.album)).id : null;

  const record = await prisma.track.upsert({
    where: { spotifyTrackId: track.id },
    update: {
      name: track.name,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      explicit: track.explicit,
      popularity: track.popularity ?? null,
      albumId,
    },
    create: {
      spotifyTrackId: track.id,
      name: track.name,
      durationMs: track.duration_ms,
      previewUrl: track.preview_url,
      explicit: track.explicit,
      popularity: track.popularity ?? null,
      albumId,
    },
  });

  for (let i = 0; i < track.artists.length; i++) {
    const artist = await upsertArtist(track.artists[i]);
    await prisma.trackArtist.upsert({
      where: { trackId_artistId: { trackId: record.id, artistId: artist.id } },
      update: { position: i },
      create: { trackId: record.id, artistId: artist.id, position: i },
    });
  }

  return record;
}

async function syncTopArtists(
  userId: string,
  accessToken: string,
  snapshotAt: Date,
): Promise<number> {
  let written = 0;
  for (const { api, db } of TIME_RANGES) {
    const res = await spotifyFetch<{ items: SpotifyArtistFull[] }>({
      accessToken,
      path: "/me/top/artists",
      searchParams: { time_range: api, limit: TOP_ITEMS_LIMIT },
    });
    for (let rank = 0; rank < res.items.length; rank++) {
      const artist = await upsertArtist(res.items[rank]);
      await prisma.userTopArtistSnapshot.create({
        data: {
          userId,
          artistId: artist.id,
          timeRange: db,
          rank: rank + 1,
          snapshotAt,
        },
      });
      written++;
    }
  }
  return written;
}

async function syncTopTracks(
  userId: string,
  accessToken: string,
  snapshotAt: Date,
): Promise<number> {
  let written = 0;
  for (const { api, db } of TIME_RANGES) {
    const res = await spotifyFetch<{ items: SpotifyTrack[] }>({
      accessToken,
      path: "/me/top/tracks",
      searchParams: { time_range: api, limit: TOP_ITEMS_LIMIT },
    });
    for (let rank = 0; rank < res.items.length; rank++) {
      const track = await upsertTrack(res.items[rank]);
      await prisma.userTopTrackSnapshot.create({
        data: {
          userId,
          trackId: track.id,
          timeRange: db,
          rank: rank + 1,
          snapshotAt,
        },
      });
      written++;
    }
  }
  return written;
}

async function syncSavedTracks(
  userId: string,
  accessToken: string,
): Promise<number> {
  const saved = await spotifyFetchAll<SpotifySavedTrack>({
    accessToken,
    path: "/me/tracks",
    maxItems: SAVED_TRACKS_CAP,
    pageSize: 50,
  });

  const seenTrackIds = new Set<string>();
  let written = 0;

  for (const item of saved) {
    if (!item.track) continue;
    const track = await upsertTrack(item.track);
    seenTrackIds.add(track.id);
    await prisma.savedTrack.upsert({
      where: { userId_trackId: { userId, trackId: track.id } },
      update: { savedAt: new Date(item.added_at) },
      create: {
        userId,
        trackId: track.id,
        savedAt: new Date(item.added_at),
      },
    });
    written++;
  }

  await prisma.savedTrack.deleteMany({
    where: { userId, trackId: { notIn: Array.from(seenTrackIds) } },
  });

  return written;
}

async function syncPlaylists(
  userId: string,
  accessToken: string,
  snapshotAt: Date,
): Promise<number> {
  const playlists = await spotifyFetchAll<SpotifyPlaylist | null>({
    accessToken,
    path: "/me/playlists",
    pageSize: 50,
  });

  let written = 0;
  let forbiddenItemFetches = 0;

  for (const pl of playlists) {
    const trackCount = pl?.tracks?.total ?? pl?.items?.total;
    if (!pl || trackCount === undefined) continue;
    try {
    const playlist = await prisma.playlist.upsert({
      where: { spotifyPlaylistId: pl.id },
      update: {
        name: pl.name,
        description: pl.description,
        isPublic: pl.public,
        trackCount,
      },
      create: {
        userId,
        spotifyPlaylistId: pl.id,
        name: pl.name,
        description: pl.description,
        isPublic: pl.public,
        trackCount,
      },
    });

    const items = await spotifyFetchAll<SpotifyPlaylistTrackItem>({
      accessToken,
      path: `/playlists/${pl.id}/items`,
      pageSize: 100,
    });

    const snapshot = await prisma.playlistSnapshot.create({
      data: {
        playlistId: playlist.id,
        snapshotAt,
        name: pl.name,
        description: pl.description,
        isPublic: pl.public,
        trackCount,
      },
    });

    const seenAtPosition = new Set<string>();
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.track) continue;
      const key = `${i}`;
      if (seenAtPosition.has(key)) continue;
      seenAtPosition.add(key);
      const track = await upsertTrack(item.track);
      await prisma.playlistTrackSnapshot.create({
        data: {
          playlistSnapshotId: snapshot.id,
          trackId: track.id,
          position: i,
          addedAt: item.added_at ? new Date(item.added_at) : null,
        },
      });
      written++;
    }
    } catch (err: unknown) {
      if (err instanceof SpotifyApiError && err.status === 403) {
        forbiddenItemFetches++;
        continue;
      }
      throw err;
    }
  }

  if (forbiddenItemFetches > 0) {
    console.warn(
      `[sync] ${forbiddenItemFetches} playlists returned 403 on /items (Spotify Dev Mode restriction)`,
    );
  }
  return written;
}

export async function runUserSync(userId: string): Promise<{
  runId: string;
  status: SyncRunStatus;
  recordsWritten: number;
  errors: string[];
}> {
  const run = await startSyncRun({ jobName: "user_full_sync", userId });
  const snapshotAt = new Date();
  const errors: string[] = [];
  let recordsWritten = 0;

  const accessToken = await getValidAccessToken(userId);

  const steps: { name: string; fn: () => Promise<number> }[] = [
    { name: "topArtists", fn: () => syncTopArtists(userId, accessToken, snapshotAt) },
    { name: "topTracks", fn: () => syncTopTracks(userId, accessToken, snapshotAt) },
    { name: "savedTracks", fn: () => syncSavedTracks(userId, accessToken) },
    { name: "playlists", fn: () => syncPlaylists(userId, accessToken, snapshotAt) },
  ];

  for (const step of steps) {
    try {
      recordsWritten += await step.fn();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);
      errors.push(`${step.name}: ${message}`);
    }
  }

  if (errors.length === 0) {
    await finishSyncRun(run.id, recordsWritten);
    return {
      runId: run.id,
      status: SyncRunStatus.SUCCEEDED,
      recordsWritten,
      errors,
    };
  }

  await prisma.syncRun.update({
    where: { id: run.id },
    data: {
      status: SyncRunStatus.FAILED,
      finishedAt: new Date(),
      recordsWritten,
      errorMessage: errors.join("\n"),
    },
  });

  return {
    runId: run.id,
    status: SyncRunStatus.FAILED,
    recordsWritten,
    errors,
  };
}
