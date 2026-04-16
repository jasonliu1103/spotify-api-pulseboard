import { ConnectSpotifyButton } from "@/components/auth/connect-button";

const focusAreas = [
  {
    kicker: "Analytics dashboard",
    title: "Turn raw Spotify data into trends that are easy to explain.",
    description:
      "Show top artists, track momentum, genre drift, repeat behavior, and discovery patterns in a way that feels like a product instead of a school assignment.",
  },
  {
    kicker: "Scheduled sync engine",
    title: "Capture snapshots over time so the data becomes more valuable every day.",
    description:
      "Use background jobs to refresh profile, library, playlist, and ranking data on a schedule, with retries, logging, and rate-limit awareness baked in.",
  },
  {
    kicker: "AI playlist curation",
    title: "Blend prompts with listening history instead of generating generic song lists.",
    description:
      "Use structured user preferences from the database to build explainable playlist suggestions that feel personal and grounded in real usage.",
  },
];

const architecture = [
  {
    step: "01",
    title: "Next.js app",
    description:
      "Handles auth, dashboard rendering, playlist actions, and the product experience the user actually touches.",
  },
  {
    step: "02",
    title: "Sync worker",
    description:
      "Runs periodic ingestion jobs, refreshes access tokens, and writes historical snapshots for analytics queries.",
  },
  {
    step: "03",
    title: "Postgres + Prisma",
    description:
      "Stores normalized artist, album, track, playlist, and snapshot data so metrics can evolve over time.",
  },
  {
    step: "04",
    title: "AI layer",
    description:
      "Transforms a plain-language prompt plus user taste signals into playlist recommendations with short reasons.",
  },
];

const roadmap = [
  {
    phase: "Phase 0",
    status: "Shipped in this repo",
    items: [
      "Next.js + TypeScript starter",
      "Portfolio-ready landing page",
      "Architecture, roadmap, and schema docs",
    ],
  },
  {
    phase: "Phase 1",
    status: "Auth and ingestion",
    items: [
      "Spotify OAuth and token refresh",
      "Initial sync for profile, top artists, top tracks, and playlists",
      "Database schema and migrations",
    ],
  },
  {
    phase: "Phase 2",
    status: "Analytics experience",
    items: [
      "Historical snapshots and dashboard queries",
      "Genre mix, repeat rate, and discovery metrics",
      "Responsive charts and filters",
    ],
  },
  {
    phase: "Phase 3",
    status: "AI playlist workflow",
    items: [
      "Prompt-driven recommendation pipeline",
      "Explainable suggestions tied to user history",
      "Save generated playlists back to Spotify",
    ],
  },
];

const repoSnapshot = [
  "A clear product direction you can share on GitHub today",
  "A polished homepage that sets the tone for the eventual app",
  "Concrete planning docs so the build can grow without thrashing",
  "An MVP scope that is ambitious but still realistic",
];

const chartBars = [34, 52, 41, 63, 57, 76, 64];

export function LandingPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-24 px-6 py-8 sm:px-10 lg:px-12 lg:py-10">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div className="reveal space-y-8">
          <div className="inline-flex items-center rounded-full border border-[var(--line)] bg-[rgba(255,251,244,0.84)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)] shadow-[0_12px_32px_rgba(31,27,23,0.07)]">
            Spotify Web API x Postgres x AI
          </div>

          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-[var(--muted)]">
              Pulseboard / Portfolio starter
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-[var(--foreground)] sm:text-6xl lg:text-7xl">
              Build a music analytics platform that is worth putting on a
              resume.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
              This project is designed to grow into a full-stack Spotify
              dashboard with scheduled data syncs, SQL-backed historical
              analytics, and AI playlist generation driven by natural-language
              prompts.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <ConnectSpotifyButton />
            <a
              href="#plan"
              className="inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,251,244,0.74)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              See the build plan
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="glass-panel rounded-3xl p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                Scope
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Full-stack
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Product UI, data pipeline, analytics, and AI working together.
              </p>
            </div>
            <div className="glass-panel rounded-3xl p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                Storage
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Postgres
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Historical snapshots unlock trends instead of one-off API
                responses.
              </p>
            </div>
            <div className="glass-panel rounded-3xl p-5">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                Outcome
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                Interview-ready
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                A project story that covers systems thinking, UX, and applied
                AI.
              </p>
            </div>
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
              <div className="rounded-full border border-[rgba(17,16,13,0.08)] bg-[rgba(29,185,84,0.14)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent-strong)]">
                MVP
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
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

                <div className="rounded-[28px] bg-[rgba(255,248,238,0.96)] p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                    Snapshot
                  </p>
                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                        Top genre blend
                      </p>
                      <p className="mt-2 text-lg font-semibold">
                        Indie / Alt / House
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                        Most active playlist
                      </p>
                      <p className="mt-2 text-lg font-semibold">Late Shift</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
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

              <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,251,244,0.92)] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--muted)]">
                      AI playlist brief
                    </p>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
                      Prompt: Late-night focus with warm indie guitars and just
                      enough energy to stay locked in.
                    </p>
                  </div>
                  <div className="rounded-full bg-[rgba(242,171,62,0.18)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-[#8b5a13]">
                    Explainable
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 p-4">
                    <p className="text-sm font-semibold">Taste anchor</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Pulls from genres and artists the user already returns to.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 p-4">
                    <p className="text-sm font-semibold">Prompt alignment</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Filters for mood, pacing, and instrumentation described in
                      plain language.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--line)] bg-white/75 p-4">
                    <p className="text-sm font-semibold">Playlist action</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      Saves the generated result back to Spotify with one click.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {focusAreas.map((area) => (
          <article key={area.title} className="glass-panel rounded-[28px] p-6">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              {area.kicker}
            </p>
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
              {area.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {area.description}
            </p>
          </article>
        ))}
      </section>

      <section
        id="system"
        className="grid gap-8 rounded-[36px] border border-[var(--line)] bg-[rgba(255,251,244,0.82)] p-6 shadow-[0_24px_80px_rgba(31,27,23,0.08)] sm:p-8"
      >
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              System design
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
              One project, four strong stories.
            </h2>
          </div>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
            The finished version should let you talk about frontend product
            work, backend data modeling, scheduled ingestion, and applied AI
            without stretching the truth.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {architecture.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] border border-[var(--line)] bg-white/75 p-5"
            >
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                {item.step}
              </p>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Current snapshot
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
            This repo already gives you something clean to push.
          </h2>
          <p className="max-w-xl text-base leading-7 text-[var(--muted)]">
            The implementation is intentionally early, but the direction is
            concrete. That makes this a good first public commit instead of an
            empty folder or a default starter template.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {repoSnapshot.map((item, index) => (
            <div key={item} className="glass-panel rounded-[26px] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
                0{index + 1}
              </p>
              <p className="mt-4 text-base leading-7 text-[var(--foreground)]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="plan" className="space-y-8">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
            Build plan
          </p>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--foreground)] sm:text-4xl">
            A focused roadmap from starter to MVP.
          </h2>
          <p className="max-w-3xl text-base leading-7 text-[var(--muted)]">
            The goal is to ship the smallest version that still feels
            portfolio-grade: working auth, stored sync data, one strong
            dashboard, and one AI feature tied to real user history.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {roadmap.map((item) => (
            <article key={item.phase} className="glass-panel rounded-[28px] p-6">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
                  {item.phase}
                </p>
                <span className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {item.status}
                </span>
              </div>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-[var(--foreground)]">
                {item.items.map((point) => (
                  <li
                    key={point}
                    className="border-t border-[rgba(17,16,13,0.08)] pt-3"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
