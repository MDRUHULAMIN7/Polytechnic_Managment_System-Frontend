"use client";

import { useSyncExternalStore } from "react";
import { Moon, SunMedium } from "lucide-react";
import { applyTheme, isTheme, resolveInitialTheme, THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
    document.cookie = `${THEME_STORAGE_KEY}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    applyTheme(next);
    window.dispatchEvent(new Event("rms-theme-change"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`focus-ring inline-flex items-center justify-center rounded-xl border border-(--line) bg-(--surface) p-2.5 text-(--text) transition hover:border-(--primary) hover:text-(--primary) ${className ?? ""}`}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <SunMedium className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
    </button>
  );
}

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const notify = () => callback();
  window.addEventListener("storage", notify);
  window.addEventListener("rms-theme-change", notify);

  return () => {
    window.removeEventListener("storage", notify);
    window.removeEventListener("rms-theme-change", notify);
  };
}

function getThemeSnapshot(): Theme {
  if (typeof document !== "undefined") {
    const fromDom = document.documentElement.dataset.theme;
    if (isTheme(fromDom)) {
      return fromDom;
    }
  }

  return resolveInitialTheme();
}

function getThemeServerSnapshot(): Theme {
  return "light";
}
