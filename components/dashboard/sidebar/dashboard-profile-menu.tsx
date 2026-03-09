"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellOff, BellRing, ChevronDown, LogOut, Palette, UserRound } from "lucide-react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { getCurrentUserProfile } from "@/lib/api/auth/profile";
import { logoutUser } from "@/lib/api/auth/session";
import type { CurrentUserProfile } from "@/lib/type/auth/profile";
import { showToast } from "@/utils/common/toast";
import { resolveName } from "@/utils/dashboard/admin/utils";
import { useAnchoredDropdown } from "@/hooks/use-anchored-dropdown";
import { useRealtimeNotifications } from "@/components/providers/realtime-provider";

function resolveDisplayName(profile: CurrentUserProfile | null) {
  const fullName = resolveName(profile?.name);
  if (fullName && fullName !== "--") {
    return fullName;
  }

  return profile?.id ?? profile?.user?.id ?? "User";
}

function resolveEmail(profile: CurrentUserProfile | null) {
  return profile?.email ?? profile?.user?.email ?? "Account";
}

function resolveInitials(value: string) {
  const initials = value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
}

export function DashboardProfileMenu() {
  const router = useRouter();
  const { notificationSoundLevel, setNotificationSoundLevel } =
    useRealtimeNotifications();
  const [open, setOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const displayName = useMemo(() => resolveDisplayName(profile), [profile]);
  const email = useMemo(() => resolveEmail(profile), [profile]);
  const initials = useMemo(() => resolveInitials(displayName), [displayName]);
  const imageSrc =
    !avatarFailed && profile?.profileImg?.trim() ? profile.profileImg.trim() : null;
  const { anchorRef, dropdownClassName, dropdownStyle } = useAnchoredDropdown({
    open,
    maxWidth: 320,
    desktopClassName:
      "absolute right-0 top-12 z-[70] w-[min(92vw,320px)] overflow-hidden rounded-3xl border border-(--line) bg-(--surface) shadow-[0_24px_56px_rgba(15,23,42,0.18)]",
  });

  useEffect(() => {
    setAvatarFailed(false);
  }, [profile?.profileImg]);

  useEffect(() => {
    let active = true;

    void getCurrentUserProfile()
      .then((result) => {
        if (active) {
          setProfile(result);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    try {
      await logoutUser();
      setOpen(false);
      showToast({
        variant: "info",
        title: "Logged out",
        description: "You have been signed out.",
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Unable to logout.",
      });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  const soundMuted = notificationSoundLevel === "mute";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="focus-ring inline-flex h-10 items-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-2.5 text-(--text) transition hover:bg-(--surface-muted)"
        aria-label="Open profile menu"
        title="Profile"
      >
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--surface-muted)">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={displayName}
              fill
              sizes="28px"
              className="object-cover"
              onError={() => setAvatarFailed(true)}
            />
          ) : (
            <span className="text-[11px] font-semibold tracking-[0.14em] text-(--text-dim)">
              {initials}
            </span>
          )}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">
          {displayName}
        </span>
        <ChevronDown
          size={16}
          className={`text-(--text-dim) transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={dropdownClassName}
            style={dropdownStyle}
          >
            <div className="border-b border-(--line) px-4 py-4">
              <p className="truncate text-sm font-semibold tracking-tight">{displayName}</p>
              <p className="mt-1 truncate text-xs text-(--text-dim)">{email}</p>
            </div>

            <div className="space-y-3 px-3 py-3">
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="focus-ring flex items-center gap-3 rounded-2xl border border-(--line) bg-(--surface-muted) px-4 py-3 text-sm font-medium transition hover:bg-(--surface)"
              >
                <UserRound size={16} className="text-(--accent)" />
                <span>View profile</span>
              </Link>

              <div className="flex items-center justify-between rounded-2xl border border-(--line) px-4 py-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Palette size={16} className="text-(--accent)" />
                    <span>Theme</span>
                  </p>
                  <p className="mt-1 text-xs text-(--text-dim)">
                    Switch light and dark mode.
                  </p>
                </div>
                <ThemeToggle className="shrink-0" />
              </div>

              <div className="rounded-2xl border border-(--line) px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      {soundMuted ? (
                        <BellOff size={16} className="text-(--accent)" />
                      ) : (
                        <BellRing size={16} className="text-(--accent)" />
                      )}
                      <span>Notification sound</span>
                    </p>
                    <p className="mt-1 text-xs text-(--text-dim)">
                      Mute or unmute alerts from here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationSoundLevel(soundMuted ? "normal" : "mute")}
                    className={`focus-ring inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                      soundMuted
                        ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
                        : "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                    }`}
                    aria-label={soundMuted ? "Unmute notifications" : "Mute notifications"}
                    title={soundMuted ? "Unmute notifications" : "Mute notifications"}
                  >
                    {soundMuted ? <BellOff size={18} /> : <BellRing size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleLogout()}
                className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/40"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
