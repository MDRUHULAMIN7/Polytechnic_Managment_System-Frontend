"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { getCurrentUserProfile } from "@/lib/api/auth/profile";
import { logoutUser } from "@/lib/api/auth/session";
import { useAnchoredDropdown } from "@/hooks/use-anchored-dropdown";
import type { CurrentUserProfile } from "@/lib/type/auth/profile";

type RootMobileProfileMenuProps = {
  dashboardHref: string;
};

function resolveDisplayName(profile: CurrentUserProfile | null) {
  return profile?.id ?? profile?.user?.id ?? "User";
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

export function RootMobileProfileMenu({ dashboardHref }: RootMobileProfileMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const displayName = useMemo(() => resolveDisplayName(profile), [profile]);
  const initials = useMemo(() => resolveInitials(displayName), [displayName]);
  const imageSrc =
    !avatarFailed && profile?.profileImg?.trim() ? profile.profileImg.trim() : null;
  const { anchorRef, dropdownClassName, dropdownRef, dropdownStyle } =
    useAnchoredDropdown({
    open,
    maxWidth: 304,
    desktopClassName:
      "absolute right-0 top-[calc(100%+0.75rem)] z-[90] w-[min(88vw,304px)] overflow-hidden rounded-[1.7rem] shadow-[0_24px_56px_rgba(15,23,42,0.22)]",
    mobileClassName: "fixed z-[90]",
    });

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
    } finally {
      setOpen(false);
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="focus-ring inline-flex h-10 items-center gap-1 rounded-2xl border border-(--line)/80 bg-(--surface)/76 px-2 text-(--text) shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-sm transition hover:bg-(--surface-muted)"
        aria-label="Open profile menu"
      >
        <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-(--surface-muted)">
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
        <ChevronDown
          size={14}
          className={`text-(--text-dim) transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={dropdownClassName}
            style={dropdownStyle}
          >
            <div className="max-h-full overflow-hidden rounded-[1.7rem] border border-(--line)/80 bg-(--surface)/96 shadow-[0_24px_56px_rgba(15,23,42,0.22)] backdrop-blur-xl">
              <div className="border-b border-(--line)/80 px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-(--surface-muted)">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt={displayName}
                        fill
                        sizes="44px"
                        className="object-cover"
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : (
                      <span className="text-sm font-semibold tracking-[0.18em] text-(--text-dim)">
                        {initials}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold tracking-tight">
                      {displayName}
                    </p>
                    <p className="mt-1 text-xs text-(--text-dim)">Quick account actions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 px-3 py-3 text-sm">
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="focus-ring flex items-center gap-3 rounded-2xl border border-(--line)/80 bg-(--surface-muted)/70 px-3.5 py-3 text-(--text) transition hover:bg-(--surface-muted)"
                >
                  <LayoutDashboard className="h-4 w-4 text-(--accent)" />
                  <span>Open dashboard</span>
                </Link>

                <Link
                  href="/dashboard/profile"
                  onClick={() => setOpen(false)}
                  className="focus-ring flex items-center gap-3 rounded-2xl border border-(--line)/80 px-3.5 py-3 text-(--text) transition hover:bg-(--surface-muted)"
                >
                  <UserRound className="h-4 w-4 text-(--accent)" />
                  <span>My profile</span>
                </Link>

                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="focus-ring flex w-full items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-left font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

