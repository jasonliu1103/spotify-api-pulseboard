import { redirect } from "next/navigation";
import { SyncButton } from "@/components/dashboard/sync-button";
import { prisma } from "@/lib/db/prisma";
import { getSessionUserId } from "@/server/auth/session";

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { spotifyAccount: true },
  });

  if (!user) redirect("/");

  const lastRun = await prisma.syncRun.findFirst({
    where: { userId, jobName: "user_full_sync" },
    orderBy: { startedAt: "desc" },
  });

  const [topArtistCount, topTrackCount, playlistCount, savedTrackCount] =
    await Promise.all([
      prisma.userTopArtistSnapshot.count({ where: { userId } }),
      prisma.userTopTrackSnapshot.count({ where: { userId } }),
      prisma.playlist.count({ where: { userId } }),
      prisma.savedTrack.count({ where: { userId } }),
    ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
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

      <section className="space-y-4 rounded-2xl border border-[var(--line)] bg-[rgba(255,251,244,0.5)] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
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
            {lastRun?.status === "FAILED" && lastRun.errorMessage && (
              <pre className="mt-2 whitespace-pre-wrap break-words rounded bg-[rgba(0,0,0,0.04)] p-2 text-xs text-red-700">
                {lastRun.errorMessage}
              </pre>
            )}
          </div>
          <SyncButton />
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Stat label="Top artists" value={topArtistCount} />
          <Stat label="Top tracks" value={topTrackCount} />
          <Stat label="Playlists" value={playlistCount} />
          <Stat label="Saved tracks" value={savedTrackCount} />
        </dl>
      </section>

      <form action="/api/auth/logout" method="post">
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,251,244,0.74)] px-5 py-2 text-sm font-medium"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(255,251,244,0.74)] p-3">
      <dt className="text-xs uppercase tracking-wider text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 text-xl font-semibold">{value}</dd>
    </div>
  );
}
