import { redirect } from "next/navigation";
import { CurrentlyPlayingCard } from "@/components/dashboard/currently-playing-card";
import { SyncButton } from "@/components/dashboard/sync-button";
import {
  TimeRangeTabs,
  parseDashboardWindow,
} from "@/components/dashboard/time-range-tabs";
import { prisma } from "@/lib/db/prisma";
import { getSessionUserId } from "@/server/auth/session";
import {
  getPlaylists,
  getRecentSaves,
  getRecentlyPlayed,
  getTopArtists,
  getTopTracks,
} from "@/server/analytics/overview";

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { spotifyAccount: true },
  });

  if (!user) redirect("/");

  const params = await searchParams;
  const activeWindow = parseDashboardWindow(params.range);

  const [lastRun, topArtists, topTracks, recentlyPlayed, recentSaves, playlists] =
    await Promise.all([
      prisma.syncRun.findFirst({
        where: { userId, jobName: "user_full_sync" },
        orderBy: { startedAt: "desc" },
      }),
      getTopArtists(userId, activeWindow, 12),
      getTopTracks(userId, activeWindow, 10),
      getRecentlyPlayed(userId, 8),
      getRecentSaves(userId, 8),
      getPlaylists(userId, 12),
    ]);

  const hasData = topArtists.length > 0 || topTracks.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-16">
      <header className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
          Signed in
        </p>
        <h1 className="text-4xl font-semibold tracking-[-0.04em]">
          Hello, {user.displayName ?? user.email ?? "Spotify user"}.
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Spotify ID: {user.spotifyAccount?.spotifyUserId ?? "—"} · Country:{" "}
          {user.spotifyAccount?.country ?? "—"} · Product:{" "}
          {user.spotifyAccount?.product ?? "—"}
        </p>
      </header>

      <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold">Spotify data</h2>
            <p className="text-sm text-[var(--muted)]">
              {lastRun
                ? `Last sync: ${lastRun.status.toLowerCase()} at ${lastRun.startedAt.toLocaleString()}${
                    lastRun.recordsWritten
                      ? ` (${lastRun.recordsWritten} records)`
                      : ""
                  }`
                : "No sync yet."}
            </p>
            {lastRun?.stepCounts ? (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-[var(--muted)]">
                {Object.entries(
                  lastRun.stepCounts as Record<string, number>,
                ).map(([name, count]) => (
                  <li key={name}>
                    {name}: <span className="text-[var(--foreground)]">{count}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {lastRun?.status === "FAILED" && lastRun.errorMessage && (
              <pre className="mt-2 whitespace-pre-wrap break-words rounded bg-[var(--overlay-faint)] p-2 text-xs text-red-700">
                {lastRun.errorMessage}
              </pre>
            )}
          </div>
          <SyncButton />
        </div>
      </section>

      <CurrentlyPlayingCard />

      {!hasData ? (
        <section className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface-muted)] p-10 text-center">
          <h2 className="text-lg font-semibold">No listening data yet</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Run a sync to pull your Spotify listening history.
          </p>
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-[var(--muted)]">
              Listening window
            </h2>
            <TimeRangeTabs active={activeWindow} />
          </div>

          <TopArtistsSection artists={topArtists} />
          <TopTracksSection tracks={topTracks} />
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentlyPlayedSection recentlyPlayed={recentlyPlayed} />
            <RecentSavesSection saves={recentSaves} />
          </div>
          <PlaylistsSection playlists={playlists} />
        </>
      )}

      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-sm font-medium"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

function SectionCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-6 ${className ?? ""}`}
    >
      <h3 className="mb-4 text-base font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function TopArtistsSection({
  artists,
}: {
  artists: Awaited<ReturnType<typeof getTopArtists>>;
}) {
  if (artists.length === 0) {
    return (
      <SectionCard title="Top artists">
        <p className="text-sm text-[var(--muted)]">
          No artists in this window yet.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Top artists">
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {artists.map((artist) => (
          <li
            key={artist.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <span className="font-mono text-xs text-[var(--muted)]">
              {String(artist.rank).padStart(2, "0")}
            </span>
            {artist.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artist.imageUrl}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[var(--overlay-soft)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{artist.name}</p>
              {artist.genres[0] && (
                <p className="truncate text-xs text-[var(--muted)]">
                  {artist.genres[0]}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

function TopTracksSection({
  tracks,
}: {
  tracks: Awaited<ReturnType<typeof getTopTracks>>;
}) {
  if (tracks.length === 0) {
    return (
      <SectionCard title="Top tracks">
        <p className="text-sm text-[var(--muted)]">
          No tracks in this window yet.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Top tracks">
      <ol className="flex flex-col gap-2">
        {tracks.map((track) => (
          <li
            key={track.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <span className="w-6 font-mono text-xs text-[var(--muted)]">
              {String(track.rank).padStart(2, "0")}
            </span>
            {track.albumImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.albumImageUrl}
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 rounded object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-[var(--overlay-soft)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{track.name}</p>
              <p className="truncate text-xs text-[var(--muted)]">
                {track.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
            <span className="font-mono text-xs text-[var(--muted)]">
              {formatDuration(track.durationMs)}
            </span>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
}

function RecentlyPlayedSection({
  recentlyPlayed,
}: {
  recentlyPlayed: Awaited<ReturnType<typeof getRecentlyPlayed>>;
}) {
  if (recentlyPlayed.length === 0) {
    return (
      <SectionCard title="Recently played">
        <p className="text-sm text-[var(--muted)]">
          No plays captured yet. The sync job ingests new plays every 30 min.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Recently played">
      <ul className="flex flex-col gap-2">
        {recentlyPlayed.map((play) => (
          <li key={play.id} className="flex items-center gap-3">
            {play.albumImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={play.albumImageUrl}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-[var(--overlay-soft)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{play.name}</p>
              <p className="truncate text-xs text-[var(--muted)]">
                {play.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
            <span className="font-mono text-xs text-[var(--muted)]">
              {formatRelativeTime(play.playedAt)}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function RecentSavesSection({
  saves,
}: {
  saves: Awaited<ReturnType<typeof getRecentSaves>>;
}) {
  if (saves.length === 0) {
    return (
      <SectionCard title="Recent saves">
        <p className="text-sm text-[var(--muted)]">No saved tracks yet.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Recent saves">
      <ul className="flex flex-col gap-2">
        {saves.map((save) => (
          <li key={save.id} className="flex items-center gap-3">
            {save.albumImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={save.albumImageUrl}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded bg-[var(--overlay-soft)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{save.name}</p>
              <p className="truncate text-xs text-[var(--muted)]">
                {save.artists.map((a) => a.name).join(", ")}
              </p>
            </div>
            <span className="font-mono text-xs text-[var(--muted)]">
              {formatRelativeDate(save.savedAt)}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function PlaylistsSection({
  playlists,
}: {
  playlists: Awaited<ReturnType<typeof getPlaylists>>;
}) {
  if (playlists.length === 0) {
    return (
      <SectionCard title="Playlists">
        <p className="text-sm text-[var(--muted)]">No playlists yet.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Playlists">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((pl) => (
          <li
            key={pl.id}
            className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium">{pl.name}</p>
              <span className="font-mono text-xs text-[var(--muted)]">
                {pl.trackCount}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {pl.isPublic === null
                ? "Visibility unknown"
                : pl.isPublic
                  ? "Public"
                  : "Private"}
            </p>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}

function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const min = Math.round(diffMs / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.round(hr / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

function formatRelativeDate(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  const days = Math.round(diffMs / day);
  if (days <= 0) return "today";
  if (days === 1) return "1d ago";
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.round(months / 12);
  return `${years}y ago`;
}