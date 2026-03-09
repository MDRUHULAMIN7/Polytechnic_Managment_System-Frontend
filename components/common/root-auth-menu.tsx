"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { logoutUser } from "@/lib/api/auth/session";

type RootAuthMenuProps = {
  hasSession: boolean;
  dashboardHref: string;
};

export function RootAuthMenu({ hasSession, dashboardHref }: RootAuthMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  if (!hasSession) {
    return (
      <Link
        href="/login"
        className="focus-ring inline-flex h-10 items-center rounded-full bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) shadow-[0_12px_26px_rgba(37,99,235,0.28)] transition hover:brightness-110"
      >
        Login
      </Link>
    );
  }

  async function handleLogout() {
    if (pending) return;
    setPending(true);

    try {
      await logoutUser();
    } catch {
      // Silent in navbar – full feedback handled on login screen/dashboard.
    } finally {
      setPending(false);
      setOpen(false);
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-full border border-(--line) bg-(--surface) px-2.5 text-sm font-medium text-(--text) transition hover:bg-(--surface-muted)"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-(--surface-muted) text-[11px] font-semibold tracking-[0.15em] text-(--text-dim)">
          PMS
        </span>
        <span className="hidden text-xs text-(--text-dim) sm:inline">
          Signed in
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-11 z-40 w-52 overflow-hidden rounded-2xl border border-(--line) bg-(--surface) shadow-[0_18px_48px_rgba(15,23,42,0.22)]"
          role="menu"
        >
          <div className="border-b border-(--line) px-3 py-2.5 text-sm">
            <p className="font-semibold tracking-tight">Account</p>
            <p className="mt-0.5 text-xs text-(--text-dim)">
              Open your dashboard or sign out.
            </p>
          </div>

          <div className="space-y-1 px-1.5 py-1.5 text-sm">
            <Link
              href={dashboardHref}
              onClick={() => setOpen(false)}
              className="focus-ring flex items-center gap-2 rounded-xl px-2.5 py-2 text-(--text) transition hover:bg-(--surface-muted)"
              role="menuitem"
            >
              <UserRound className="h-4 w-4 text-(--accent)" />
              <span>Dashboard</span>
            </Link>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={pending}
              className="focus-ring flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-rose-600 transition hover:bg-rose-50 dark:text-rose-200 dark:hover:bg-rose-950/40"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              <span>{pending ? "Signing out..." : "Logout"}</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

