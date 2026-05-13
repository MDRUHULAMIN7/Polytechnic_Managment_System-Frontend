"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";
type ThemeToggleProps = {
  className?: string;
};

const THEME_KEY = "pms_theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function readTheme(): Theme {
  if (typeof localStorage === "undefined") return "light";
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
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem(THEME_KEY, theme);
  document.cookie = `${THEME_KEY}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const currentTheme = readTheme();
    applyTheme(currentTheme);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(currentTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setTheme(nextTheme);
  }

  const baseClassName =
    "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg border border-(--line) bg-(--surface) text-(--text) transition hover:bg-(--surface-muted)";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={className ? `${baseClassName} ${className}` : baseClassName}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {!mounted ? (
        <div className="h-4.5 w-4.5" />
      ) : theme === "dark" ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}
