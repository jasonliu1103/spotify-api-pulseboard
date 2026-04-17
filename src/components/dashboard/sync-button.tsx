"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";

interface SyncResponse {
  error?: string;
  errors?: string[];
}

export function SyncButton() {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setIsSyncing(true);
    setError(null);

    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | SyncResponse
        | null;

      if (!response.ok) {
        const message =
          payload?.errors?.join("\n") ??
          payload?.error ??
          `Spotify sync failed (HTTP ${response.status}).`;
        setError(message);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Spotify sync failed.",
      );
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSyncing ? "Syncing..." : "Sync now"}
      </button>

      {error ? (
        <p className="max-w-xs text-right text-xs text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
