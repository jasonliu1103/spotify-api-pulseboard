import { ConnectSpotifyButton } from "@/components/auth/connect-button";

const features = [
  {
    title: "Top artists & tracks",
    body: "Ranked across short, medium, and long time ranges.",
  },
  {
    title: "Genre mix",
    body: "Aggregated from the artists you actually listen to.",
  },
  {
    title: "AI playlists",
    body: "Prompt-driven generation grounded in your real taste data.",
  },
];

const chartBars = [34, 52, 41, 63, 57, 76, 64];

export function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-6 py-12 sm:px-10 lg:px-12 lg:py-16">
      <section className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div className="reveal space-y-8">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
            Pulseboard
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            A dashboard for your Spotify data.
          </h1>
          <div>
            <ConnectSpotifyButton />
          </div>
        </div>

        <div className="reveal lg:justify-self-end">
          <div className="glass-panel float-card rounded-[32px] p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
                  Dashboard preview
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                  Listening pulse
                </h2>
              </div>
              <div className="rounded-full border border-[var(--line)] bg-[rgba(29,185,84,0.14)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                Live
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[28px] bg-[linear-gradient(180deg,#112717_0%,#0b1e12_100%)] p-5 text-[#edf7ef] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#a1c6a7]">
                    Trend line
                  </p>
                  <p className="text-sm font-medium text-[#d3ebd7]">
                    12-week momentum
                  </p>
                </div>
                <div className="mt-6 flex h-44 items-end gap-2">
                  {chartBars.map((height, index) => (
                    <div
                      key={height}
                      className="flex-1 rounded-t-2xl bg-[linear-gradient(180deg,#8fe6a5_0%,#1db954_100%)]"
                      style={{
                        height: `${height}%`,
                        opacity: index === chartBars.length - 1 ? 1 : 0.72,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-[#a1c6a7]">Repeat rate</p>
                    <p className="mt-1 text-lg font-semibold">41%</p>
                  </div>
                  <div>
                    <p className="text-[#a1c6a7]">Discovery</p>
                    <p className="mt-1 text-lg font-semibold">18 tracks</p>
                  </div>
                  <div>
                    <p className="text-[#a1c6a7]">Mood shift</p>
                    <p className="mt-1 text-lg font-semibold">+12 bpm</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-[var(--surface-muted)] p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                  Snapshot
                </p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      Top genre blend
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      Indie / Alt / House
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      Most active playlist
                    </p>
                    <p className="mt-2 text-lg font-semibold">Late Shift</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-strong)] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                      Freshest artist
                    </p>
                    <p className="mt-2 text-lg font-semibold">
                      Recent discovery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((item) => (
          <article key={item.title} className="glass-panel rounded-[24px] p-5">
            <h3 className="text-base font-semibold tracking-[-0.02em] text-[var(--foreground)]">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {item.body}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
