interface ConnectSpotifyButtonProps {
  variant?: "primary" | "secondary";
  label?: string;
}

export function ConnectSpotifyButton({
  variant = "primary",
  label = "Connect Spotify",
}: ConnectSpotifyButtonProps) {
  const className =
    variant === "primary"
      ? "inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-ink transition-transform duration-200 hover:-translate-y-0.5"
      : "inline-flex items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] px-6 py-3 text-sm font-medium text-[var(--foreground)] transition-transform duration-200 hover:-translate-y-0.5";

  return (
    <a href="/api/auth/spotify" className={className}>
      {label}
    </a>
  );
}
