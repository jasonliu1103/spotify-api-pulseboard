import { SpotifyTimeRange } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { DashboardWindow } from "@/components/dashboard/time-range-tabs";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function sevenDaysAgo(): Date {
  return new Date(Date.now() - SEVEN_DAYS_MS);
}

function isSpotifyRange(window: DashboardWindow): window is SpotifyTimeRange {
  return window !== "last_7_days";
}

export async function getLatestSnapshotAt(
  userId: string,
  timeRange: SpotifyTimeRange,
): Promise<Date | null> {
  const row = await prisma.userTopArtistSnapshot.findFirst({
    where: { userId, timeRange },
    orderBy: { snapshotAt: "desc" },
    select: { snapshotAt: true },
  });
  return row?.snapshotAt ?? null;
}

async function getTopArtistsFromSnapshots(
  userId: string,
  timeRange: SpotifyTimeRange,
  limit: number,
) {
  const snapshotAt = await getLatestSnapshotAt(userId, timeRange);
  if (!snapshotAt) return [];

  const rows = await prisma.userTopArtistSnapshot.findMany({
    where: { userId, timeRange, snapshotAt },
    orderBy: { rank: "asc" },
    take: limit,
    include: { artist: true },
  });

  return rows.map((row) => ({
    rank: row.rank,
    id: row.artist.id,
    spotifyArtistId: row.artist.spotifyArtistId,
    name: row.artist.name,
    imageUrl: row.artist.imageUrl,
    genres: row.artist.genres,
    popularity: row.artist.popularity,
  }));
}

async function getTopArtistsFromEvents(userId: string, limit: number) {
  const events = await prisma.recentlyPlayedEvent.findMany({
    where: { userId, playedAt: { gte: sevenDaysAgo() } },
    select: {
      track: {
        select: {
          artists: {
            orderBy: { position: "asc" },
            select: { artist: true },
          },
        },
      },
    },
  });

  const counts = new Map<string, { plays: number; artist: typeof events[number]["track"]["artists"][number]["artist"] }>();
  for (const event of events) {
    for (const ta of event.track.artists) {
      const existing = counts.get(ta.artist.id);
      if (existing) existing.plays += 1;
      else counts.set(ta.artist.id, { plays: 1, artist: ta.artist });
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit)
    .map((entry, i) => ({
      rank: i + 1,
      id: entry.artist.id,
      spotifyArtistId: entry.artist.spotifyArtistId,
      name: entry.artist.name,
      imageUrl: entry.artist.imageUrl,
      genres: entry.artist.genres,
      popularity: entry.artist.popularity,
    }));
}

export async function getTopArtists(
  userId: string,
  window: DashboardWindow,
  limit = 20,
) {
  if (isSpotifyRange(window)) {
    return getTopArtistsFromSnapshots(userId, window, limit);
  }
  return getTopArtistsFromEvents(userId, limit);
}

async function getTopTracksFromSnapshots(
  userId: string,
  timeRange: SpotifyTimeRange,
  limit: number,
) {
  const snapshotAt = await prisma.userTopTrackSnapshot
    .findFirst({
      where: { userId, timeRange },
      orderBy: { snapshotAt: "desc" },
      select: { snapshotAt: true },
    })
    .then((row) => row?.snapshotAt ?? null);
  if (!snapshotAt) return [];

  const rows = await prisma.userTopTrackSnapshot.findMany({
    where: { userId, timeRange, snapshotAt },
    orderBy: { rank: "asc" },
    take: limit,
    include: {
      track: {
        include: {
          album: true,
          artists: {
            orderBy: { position: "asc" },
            include: { artist: true },
          },
        },
      },
    },
  });

  return rows.map((row) => ({
    rank: row.rank,
    id: row.track.id,
    spotifyTrackId: row.track.spotifyTrackId,
    name: row.track.name,
    durationMs: row.track.durationMs,
    albumName: row.track.album?.name ?? null,
    albumImageUrl: row.track.album?.imageUrl ?? null,
    artists: row.track.artists.map((ta) => ({
      id: ta.artist.id,
      name: ta.artist.name,
    })),
  }));
}

async function getTopTracksFromEvents(userId: string, limit: number) {
  const grouped = await prisma.recentlyPlayedEvent.groupBy({
    by: ["trackId"],
    where: { userId, playedAt: { gte: sevenDaysAgo() } },
    _count: { trackId: true },
    orderBy: { _count: { trackId: "desc" } },
    take: limit,
  });

  if (grouped.length === 0) return [];

  const tracks = await prisma.track.findMany({
    where: { id: { in: grouped.map((g) => g.trackId) } },
    include: {
      album: true,
      artists: {
        orderBy: { position: "asc" },
        include: { artist: true },
      },
    },
  });
  const byId = new Map(tracks.map((t) => [t.id, t]));

  return grouped
    .map((g, i) => {
      const track = byId.get(g.trackId);
      if (!track) return null;
      return {
        rank: i + 1,
        id: track.id,
        spotifyTrackId: track.spotifyTrackId,
        name: track.name,
        durationMs: track.durationMs,
        albumName: track.album?.name ?? null,
        albumImageUrl: track.album?.imageUrl ?? null,
        artists: track.artists.map((ta) => ({
          id: ta.artist.id,
          name: ta.artist.name,
        })),
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

export async function getTopTracks(
  userId: string,
  window: DashboardWindow,
  limit = 20,
) {
  if (isSpotifyRange(window)) {
    return getTopTracksFromSnapshots(userId, window, limit);
  }
  return getTopTracksFromEvents(userId, limit);
}

export async function getRecentSaves(userId: string, limit = 10) {
  const rows = await prisma.savedTrack.findMany({
    where: { userId },
    orderBy: { savedAt: "desc" },
    take: limit,
    include: {
      track: {
        include: {
          album: true,
          artists: {
            orderBy: { position: "asc" },
            include: { artist: true },
          },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    savedAt: row.savedAt,
    trackId: row.track.id,
    name: row.track.name,
    albumImageUrl: row.track.album?.imageUrl ?? null,
    artists: row.track.artists.map((ta) => ({
      id: ta.artist.id,
      name: ta.artist.name,
    })),
  }));
}

export async function getRecentlyPlayed(userId: string, limit = 10) {
  const rows = await prisma.recentlyPlayedEvent.findMany({
    where: { userId },
    orderBy: { playedAt: "desc" },
    take: limit,
    include: {
      track: {
        include: {
          album: true,
          artists: {
            orderBy: { position: "asc" },
            include: { artist: true },
          },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    playedAt: row.playedAt,
    trackId: row.track.id,
    name: row.track.name,
    albumImageUrl: row.track.album?.imageUrl ?? null,
    artists: row.track.artists.map((ta) => ({
      id: ta.artist.id,
      name: ta.artist.name,
    })),
  }));
}

export async function getPlaylists(userId: string, limit = 50) {
  const rows = await prisma.playlist.findMany({
    where: { userId },
    orderBy: [{ trackCount: "desc" }, { updatedAt: "desc" }],
    take: limit,
    select: {
      id: true,
      spotifyPlaylistId: true,
      name: true,
      description: true,
      isPublic: true,
      trackCount: true,
      updatedAt: true,
    },
  });
  return rows;
}
