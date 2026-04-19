import Link from "next/link";
import { SpotifyTimeRange } from "@prisma/client";

export type DashboardWindow = "last_7_days" | SpotifyTimeRange;

const OPTIONS: { value: DashboardWindow; label: string; slug: string }[] = [
  { value: "last_7_days", label: "Last 7 days", slug: "7d" },
  { value: SpotifyTimeRange.SHORT_TERM, label: "Last 4 weeks", slug: "short" },
  { value: SpotifyTimeRange.MEDIUM_TERM, label: "Last 6 months", slug: "medium" },
  { value: SpotifyTimeRange.LONG_TERM, label: "All time", slug: "long" },
];

export function TimeRangeTabs({ active }: { active: DashboardWindow }) {
  return (
    <div className="inline-flex rounded-full border border-[var(--line)] bg-[var(--surface)] p-1">
      {OPTIONS.map((opt) => {
        const isActive = opt.value === active;
        return (
          <Link
            key={String(opt.value)}
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

export function parseDashboardWindow(
  slug: string | string[] | undefined,
): DashboardWindow {
  const value = Array.isArray(slug) ? slug[0] : slug;
  if (value === "7d") return "last_7_days";
  if (value === "short") return SpotifyTimeRange.SHORT_TERM;
  if (value === "long") return SpotifyTimeRange.LONG_TERM;
  return SpotifyTimeRange.MEDIUM_TERM;
}
