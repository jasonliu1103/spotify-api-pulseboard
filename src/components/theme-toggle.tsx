"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_EVENT = "pulseboard-theme-change";

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("pulseboard-theme", next);
    } catch {
      // private mode / storage unavailable
    }
    window.dispatchEvent(new Event(THEME_EVENT));
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
        {theme === "dark" ? "☀" : "☾"}
      </span>
    </button>
  );
}
