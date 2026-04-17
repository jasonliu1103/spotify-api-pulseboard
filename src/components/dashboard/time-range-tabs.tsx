import Link from "next/link";
import { SpotifyTimeRange } from "@prisma/client";

const OPTIONS: { value: SpotifyTimeRange; label: string; slug: string }[] = [
  { value: SpotifyTimeRange.SHORT_TERM, label: "Last 4 weeks", slug: "short" },
  { value: SpotifyTimeRange.MEDIUM_TERM, label: "Last 6 months", slug: "medium" },
  { value: SpotifyTimeRange.LONG_TERM, label: "All time", slug: "long" },
];

export function TimeRangeTabs({ active }: { active: SpotifyTimeRange }) {
  return (
    <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === active;
        return (
          <Link
            key={opt.value}
            href={`/dashboard?range=${opt.slug}`}
            scroll={false}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              isActive
                ? "bg-accent text-accent-ink"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {opt.label}
          </Link>
        );
      })}
    </div>
  );
}

export function parseTimeRange(slug: string | string[] | undefined): SpotifyTimeRange {
  const value = Array.isArray(slug) ? slug[0] : slug;
  if (value === "short") return SpotifyTimeRange.SHORT_TERM;
  if (value === "long") return SpotifyTimeRange.LONG_TERM;
  return SpotifyTimeRange.MEDIUM_TERM;
}