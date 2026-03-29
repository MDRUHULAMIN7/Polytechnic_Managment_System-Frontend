"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { RootNoticeDropdown } from "@/components/common/root-notice-dropdown";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { DashboardProfileMenu } from "@/components/dashboard/sidebar/dashboard-profile-menu";
import { RealtimeProvider } from "@/components/providers/realtime-provider";

type NavLink = {
  label: string;
  href: string;
};

const navLinks: NavLink[] = [
  { label: "Events", href: "/events" },
  { label: "Alumni", href: "/alumni" },
  { label: "Calendar", href: "/academic-calendar" },
  { label: "Instructors", href: "/academic-instructors" },
];

type DashboardRole = "admin" | "superAdmin" | "instructor" | "student";

function parseRole(value: string | undefined): DashboardRole | undefined {
  if (
    value === "admin" ||
    value === "superAdmin" ||
    value === "instructor" ||
    value === "student"
  ) {
    return value;
  }

  return undefined;
}

function dashboardHref(role: DashboardRole | undefined) {
  if (role === "student") {
    return "/dashboard/student";
  }

  if (role === "instructor") {
    return "/dashboard/instructor";
  }

  if (role === "admin" || role === "superAdmin") {
    return "/dashboard/admin";
  }

  return "/dashboard";
}

export function PublicNavbar() {
  const pathname = usePathname();
  const [menuState, setMenuState] = useState(() => ({
    open: false,
    path: pathname,
  }));
  const role = useMemo(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("pms_role="))
      ?.split("=")[1];

    return parseRole(cookieValue);
  }, []);
  const isOpen = menuState.open && menuState.path === pathname;
  const closeMenu = useCallback(() => {
    setMenuState({ open: false, path: pathname });
  }, [pathname]);
  const openMenu = useCallback(() => {
    setMenuState({ open: true, path: pathname });
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => closeMenu();
    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, [closeMenu]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);



  return (
    <RealtimeProvider role={role}>
      <header className="public-nav">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
          <div className="public-nav-inner">
            <Link href="/" className="public-nav-logo font-display text-2xl tracking-[-0.03em]">
              RPI Polytechnic
            </Link>

            <nav className="public-nav-links hidden lg:flex" aria-label="Primary">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`public-nav-link text-sm font-semibold tracking-[0.02em] ${isActive ? "public-nav-link-active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="public-nav-actions">
              <div className="hidden items-center gap-2 lg:flex">
              
                <RootNoticeDropdown />
                <ThemeToggle />
                {role ? (
                  <>
                    <NotificationBell />
                    <DashboardProfileMenu />
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="focus-ring inline-flex h-11 items-center rounded-2xl bg-(--accent) px-5 text-xs font-bold uppercase tracking-[0.16em] text-(--accent-ink) shadow-[0_16px_32px_color-mix(in_srgb,var(--accent)_26%,transparent)] transition hover:brightness-110"
                  >
                    Portal Login
                  </Link>
                )}
              </div>

              <div className="inline-flex items-center gap-2 lg:hidden">
                <RootNoticeDropdown compact />
                {role ? <NotificationBell /> : null}
                {role ? <DashboardProfileMenu /> : null}
              </div>

              <button
                type="button"
                className="public-nav-toggle focus-ring inline-flex lg:hidden"
                onClick={() => {
                  if (!isOpen) {
                    openMenu();
                    return;
                  }

                  closeMenu();
                }}
                aria-label="Open menu"
                aria-expanded={isOpen}
                aria-controls="public-mobile-menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen ? (
            <motion.div
              className="public-drawer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <motion.button
                type="button"
                className="public-drawer-backdrop"
                onClick={closeMenu}
                aria-label="Close menu"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
              <motion.aside
                id="public-mobile-menu"
                className="public-drawer-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 420, damping: 40 }}
              >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-(--text)">Menu</span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="public-nav-toggle focus-ring inline-flex"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-3" aria-label="Mobile">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-semibold ${
                        isActive ? "text-(--accent)" : "text-(--text)"
                      }`}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto flex flex-col gap-3">
                <ThemeToggle />
                {role ? (
                  <Link
                    href={dashboardHref(role)}
                    className="focus-ring inline-flex h-11 items-center justify-center rounded-2xl bg-(--accent) px-4 text-xs font-bold uppercase tracking-[0.16em] text-(--accent-ink) shadow-[0_16px_32px_color-mix(in_srgb,var(--accent)_26%,transparent)] transition hover:brightness-110"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="focus-ring inline-flex h-11 items-center justify-center rounded-2xl bg-(--accent) px-4 text-xs font-bold uppercase tracking-[0.16em] text-(--accent-ink) shadow-[0_16px_32px_color-mix(in_srgb,var(--accent)_26%,transparent)] transition hover:brightness-110"
                  >
                    Portal Login
                  </Link>
                )}
              </div>
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </RealtimeProvider>
  );
}
