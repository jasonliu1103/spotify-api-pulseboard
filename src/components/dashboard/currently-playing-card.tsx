"use client";

import { useEffect, useRef, useState } from "react";

type NowPlaying = {
  isPlaying: boolean;
  progressMs: number | null;
  trackId: string;
  name: string;
  durationMs: number;
  albumImageUrl: string | null;
  artists: { id: string; name: string }[];
};

type FetchState =
  | { kind: "loading" }
  | { kind: "idle"; playing: NowPlaying | null };

const POLL_MS = 15_000;

export function CurrentlyPlayingCard() {
  const [state, setState] = useState<FetchState>({ kind: "loading" });
  const fetchedAtRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/now-playing", { cache: "no-store" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = (await res.json()) as { playing: NowPlaying | null };
        if (cancelled) return;
        fetchedAtRef.current = Date.now();
        setState({ kind: "idle", playing: data.playing });
      } catch {
        if (cancelled) return;
        setState({ kind: "idle", playing: null });
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (state.kind === "loading") {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-6">
        <h3 className="mb-4 text-base font-semibold">Now playing</h3>
        <p className="text-sm text-[var(--muted)]">Checking Spotify…</p>
      </section>
    );
  }

  const { playing } = state;

  if (!playing) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-6">
        <h3 className="mb-4 text-base font-semibold">Now playing</h3>
        <p className="text-sm text-[var(--muted)]">Nothing playing right now.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Now playing</h3>
        <span className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              playing.isPlaying
                ? "bg-[var(--accent-strong)]"
                : "bg-[var(--overlay-soft)]"
            }`}
          />
          {playing.isPlaying ? "playing" : "paused"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {playing.albumImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={playing.albumImageUrl}
            alt=""
            width={72}
            height={72}
            className="h-18 w-18 rounded-lg object-cover"
          />
        ) : (
          <div className="h-18 w-18 rounded-lg bg-[var(--overlay-soft)]" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-medium">{playing.name}</p>
          <p className="truncate text-sm text-[var(--muted)]">
            {playing.artists.map((a) => a.name).join(", ")}
          </p>
          <Progress
            key={`${playing.trackId}-${fetchedAtRef.current}`}
            progressMs={playing.progressMs}
            durationMs={playing.durationMs}
            isPlaying={playing.isPlaying}
            fetchedAt={fetchedAtRef.current}
          />
        </div>
      </div>
    </section>
  );
}

function Progress({
  progressMs,
  durationMs,
  isPlaying,
  fetchedAt,
}: {
  progressMs: number | null;
  durationMs: number;
  isPlaying: boolean;
  fetchedAt: number;
}) {
  const [elapsed, setElapsed] = useState(progressMs ?? 0);

  useEffect(() => {
    if (!isPlaying || progressMs === null) return;
    const id = setInterval(() => {
      setElapsed(
        Math.min(durationMs, progressMs + (Date.now() - fetchedAt)),
      );
    }, 1000);
    return () => clearInterval(id);
  }, [progressMs, durationMs, isPlaying, fetchedAt]);

  if (progressMs === null || durationMs === 0) return null;

  const pct = Math.max(0, Math.min(100, (elapsed / durationMs) * 100));

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="font-mono text-xs text-[var(--muted)]">
        {formatMs(elapsed)}
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--overlay-faint)]">
        <div
          className="h-full rounded-full bg-[var(--accent-strong)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-xs text-[var(--muted)]">
        {formatMs(durationMs)}
      </span>
    </div>
  );
}

function formatMs(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
