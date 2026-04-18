"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const COOKIE = "pulseboard-theme";
const STORAGE_KEY = "pulseboard-theme";
const EVENT = "pulseboard-theme-change";
const MAX_AGE = 60 * 60 * 24 * 365;

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.cookie = `${COOKIE}=${next}; path=/; max-age=${MAX_AGE}; samesite=lax`;
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      aria-pressed={theme === "dark"}
      onClick={toggle}
      className="fixed right-5 top-5 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--surface)] text-[var(--foreground)] shadow-[var(--panel-shadow)] backdrop-blur transition-transform hover:-translate-y-0.5"
    >
      <span aria-hidden="true" suppressHydrationWarning className="text-base leading-none">
        {theme === "dark" ? "\u2600" : "\u263E"}
      </span>
    </button>
  );
}
