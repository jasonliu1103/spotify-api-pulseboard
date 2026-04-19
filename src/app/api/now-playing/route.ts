import { NextResponse } from "next/server";
import { SpotifyApiError, spotifyFetch } from "@/lib/spotify/client";
import { getValidAccessToken } from "@/server/auth/spotify";
import { getSessionUserId } from "@/server/auth/session";

export const dynamic = "force-dynamic";

interface SpotifyCurrentlyPlaying {
  is_playing: boolean;
  progress_ms: number | null;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    artists: { id: string; name: string }[];
    album?: { name: string; images?: { url: string }[] };
  } | null;
}

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getValidAccessToken(userId);
    const res = await spotifyFetch<SpotifyCurrentlyPlaying | undefined>({
      accessToken,
      path: "/me/player/currently-playing",
    });

    if (!res || !res.item) {
      return NextResponse.json({ playing: null });
    }

    return NextResponse.json({
      playing: {
        isPlaying: res.is_playing,
        progressMs: res.progress_ms,
        trackId: res.item.id,
        name: res.item.name,
        durationMs: res.item.duration_ms,
        albumImageUrl: res.item.album?.images?.[0]?.url ?? null,
        artists: res.item.artists.map((a) => ({ id: a.id, name: a.name })),
      },
    });
  } catch (error) {
    if (error instanceof SpotifyApiError && error.status === 403) {
      return NextResponse.json({ playing: null, forbidden: true });
    }
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
