import { SpotifyTimeRange } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

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

export async function getTopArtists(
  userId: string,
  timeRange: SpotifyTimeRange,
  limit = 20,
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

export async function getTopTracks(
  userId: string,
  timeRange: SpotifyTimeRange,
  limit = 20,
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

export async function getGenreMix(
  userId: string,
  timeRange: SpotifyTimeRange,
  limit = 10,
): Promise<{ genre: string; count: number }[]> {
  const snapshotAt = await getLatestSnapshotAt(userId, timeRange);
  if (!snapshotAt) return [];

  const rows = await prisma.userTopArtistSnapshot.findMany({
    where: { userId, timeRange, snapshotAt },
    include: { artist: { select: { genres: true } } },
  });

  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const genre of row.artist.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
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

export async function getDashboardOverview(
  userId: string,
  timeRange: SpotifyTimeRange,
) {
  const [topArtistsCount, topTracksCount, savedTracksCount, playlistsCount] =
    await prisma.$transaction([
      prisma.userTopArtistSnapshot.count({
        where: { userId, timeRange },
      }),
      prisma.userTopTrackSnapshot.count({
        where: { userId, timeRange },
      }),
      prisma.savedTrack.count({
        where: { userId },
      }),
      prisma.playlist.count({
        where: { userId },
      }),
    ]);

  return {
    topArtistsCount,
    topTracksCount,
    savedTracksCount,
    playlistsCount,
  };
}