"use client";

import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const THEME_KEY = "pms_theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readTheme(): Theme {
  const fromStorage = localStorage.getItem(THEME_KEY);
  if (fromStorage === "dark" || fromStorage === "light") {
    return fromStorage;
  }

  const fromCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${THEME_KEY}=`))
    ?.split("=")[1];
  if (fromCookie === "dark" || fromCookie === "light") {
    return fromCookie;
  }

  return systemTheme();
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.cookie = `${THEME_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

export function ThemeToggle() {
  function toggleTheme() {
    const current = readTheme();
    const nextTheme: Theme = current === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--line) bg-(--surface) text-(--text) transition hover:bg-(--surface-muted)"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <span className="theme-icon-light">
        <Moon size={18} />
      </span>
      <span className="theme-icon-dark">
        <Sun size={18} />
      </span>
    </button>
  );
}
