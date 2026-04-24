import { SpotifyTimeRange } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { DashboardWindow } from "@/components/dashboard/time-range-tabs";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

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

  const priorSnapshot = await prisma.userTopArtistSnapshot.findFirst({
    where: { userId, timeRange, snapshotAt: { lt: snapshotAt } },
    orderBy: { snapshotAt: "desc" },
    select: { snapshotAt: true },
  });

  const [rows, priorRows] = await Promise.all([
    prisma.userTopArtistSnapshot.findMany({
      where: { userId, timeRange, snapshotAt },
      orderBy: { rank: "asc" },
      take: limit,
      include: { artist: true },
    }),
    priorSnapshot
      ? prisma.userTopArtistSnapshot.findMany({
          where: { userId, timeRange, snapshotAt: priorSnapshot.snapshotAt },
          select: { artistId: true, rank: true },
        })
      : Promise.resolve([]),
  ]);

  const priorRankById = new Map(priorRows.map((r) => [r.artistId, r.rank]));

  return rows.map((row) => ({
    rank: row.rank,
    previousRank: priorRankById.get(row.artistId) ?? null,
    id: row.artist.id,
    spotifyArtistId: row.artist.spotifyArtistId,
    name: row.artist.name,
    imageUrl: row.artist.imageUrl,
    genres: row.artist.genres,
    popularity: row.artist.popularity,
  }));
}

async function getTopArtistsFromEvents(userId: string, limit: number) {
  const now = Date.now();
  const currentStart = new Date(now - SEVEN_DAYS_MS);
  const priorStart = new Date(now - 2 * SEVEN_DAYS_MS);

  const [events, priorEvents] = await Promise.all([
    prisma.recentlyPlayedEvent.findMany({
      where: { userId, playedAt: { gte: currentStart } },
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
    }),
    prisma.recentlyPlayedEvent.findMany({
      where: { userId, playedAt: { gte: priorStart, lt: currentStart } },
      select: {
        track: {
          select: {
            artists: {
              orderBy: { position: "asc" },
              select: { artistId: true },
            },
          },
        },
      },
    }),
  ]);

  const counts = new Map<string, { plays: number; artist: typeof events[number]["track"]["artists"][number]["artist"] }>();
  for (const event of events) {
    for (const ta of event.track.artists) {
      const existing = counts.get(ta.artist.id);
      if (existing) existing.plays += 1;
      else counts.set(ta.artist.id, { plays: 1, artist: ta.artist });
    }
  }

  const priorCounts = new Map<string, number>();
  for (const event of priorEvents) {
    for (const ta of event.track.artists) {
      priorCounts.set(ta.artistId, (priorCounts.get(ta.artistId) ?? 0) + 1);
    }
  }
  const priorRankById = new Map<string, number>();
  [...priorCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([artistId], i) => priorRankById.set(artistId, i + 1));

  return [...counts.values()]
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit)
    .map((entry, i) => ({
      rank: i + 1,
      previousRank: priorRankById.get(entry.artist.id) ?? null,
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

  const priorSnapshot = await prisma.userTopTrackSnapshot.findFirst({
    where: { userId, timeRange, snapshotAt: { lt: snapshotAt } },
    orderBy: { snapshotAt: "desc" },
    select: { snapshotAt: true },
  });

  const [rows, priorRows] = await Promise.all([
    prisma.userTopTrackSnapshot.findMany({
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
    }),
    priorSnapshot
      ? prisma.userTopTrackSnapshot.findMany({
          where: { userId, timeRange, snapshotAt: priorSnapshot.snapshotAt },
          select: { trackId: true, rank: true },
        })
      : Promise.resolve([]),
  ]);

  const priorRankById = new Map(priorRows.map((r) => [r.trackId, r.rank]));

  return rows.map((row) => ({
    rank: row.rank,
    previousRank: priorRankById.get(row.trackId) ?? null,
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
  const now = Date.now();
  const currentStart = new Date(now - SEVEN_DAYS_MS);
  const priorStart = new Date(now - 2 * SEVEN_DAYS_MS);

  const [grouped, priorGrouped] = await Promise.all([
    prisma.recentlyPlayedEvent.groupBy({
      by: ["trackId"],
      where: { userId, playedAt: { gte: currentStart } },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
      take: limit,
    }),
    prisma.recentlyPlayedEvent.groupBy({
      by: ["trackId"],
      where: { userId, playedAt: { gte: priorStart, lt: currentStart } },
      _count: { trackId: true },
      orderBy: { _count: { trackId: "desc" } },
    }),
  ]);

  if (grouped.length === 0) return [];

  const priorRankById = new Map<string, number>();
  priorGrouped.forEach((g, i) => priorRankById.set(g.trackId, i + 1));

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
        previousRank: priorRankById.get(g.trackId) ?? null,
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

export interface RepeatRate {
  totalPlays: number;
  repeatPlays: number;
  rate: number | null;
}

export async function getRepeatRate(userId: string): Promise<RepeatRate> {
  const now = Date.now();
  const currentStart = new Date(now - SEVEN_DAYS_MS);
  const priorStart = new Date(now - 2 * SEVEN_DAYS_MS);

  const [currentPlays, priorPlays] = await Promise.all([
    prisma.recentlyPlayedEvent.findMany({
      where: { userId, playedAt: { gte: currentStart } },
      select: { trackId: true },
    }),
    prisma.recentlyPlayedEvent.findMany({
      where: { userId, playedAt: { gte: priorStart, lt: currentStart } },
      select: { trackId: true },
    }),
  ]);

  const priorTrackIds = new Set(priorPlays.map((p) => p.trackId));
  const repeatPlays = currentPlays.reduce(
    (sum, p) => (priorTrackIds.has(p.trackId) ? sum + 1 : sum),
    0,
  );

  return {
    totalPlays: currentPlays.length,
    repeatPlays,
    rate: currentPlays.length > 0 ? repeatPlays / currentPlays.length : null,
  };
}

export interface DiscoveryRate {
  totalPlays: number;
  newArtistPlays: number;
  rate: number | null;
}

export async function getDiscoveryRate(userId: string): Promise<DiscoveryRate> {
  const now = Date.now();
  const currentStart = new Date(now - SEVEN_DAYS_MS);
  const priorStart = new Date(now - 2 * SEVEN_DAYS_MS);

  const [currentPlays, priorPlays] = await Promise.all([
    prisma.recentlyPlayedEvent.findMany({
      where: { userId, playedAt: { gte: currentStart } },
      select: {
        track: {
          select: {
            artists: { select: { artistId: true } },
          },
        },
      },
    }),
    prisma.recentlyPlayedEvent.findMany({
      where: { userId, playedAt: { gte: priorStart, lt: currentStart } },
      select: {
        track: {
          select: {
            artists: { select: { artistId: true } },
          },
        },
      },
    }),
  ]);

  const priorArtistIds = new Set<string>();
  for (const p of priorPlays) {
    for (const ta of p.track.artists) priorArtistIds.add(ta.artistId);
  }

  const newArtistPlays = currentPlays.reduce((sum, p) => {
    const anyNew = p.track.artists.some((ta) => !priorArtistIds.has(ta.artistId));
    return anyNew ? sum + 1 : sum;
  }, 0);

  return {
    totalPlays: currentPlays.length,
    newArtistPlays,
    rate: currentPlays.length > 0 ? newArtistPlays / currentPlays.length : null,
  };
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
