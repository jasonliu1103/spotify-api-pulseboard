import { SpotifyTimeRange } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

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
