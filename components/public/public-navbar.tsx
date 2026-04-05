"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  GraduationCap,
  Menu,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { RootNoticeDropdown } from "@/components/common/root-notice-dropdown";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { DashboardProfileMenu } from "@/components/dashboard/sidebar/dashboard-profile-menu";
import { RealtimeProvider } from "@/components/providers/realtime-provider";

type NavLink = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

const navLinks: NavLink[] = [
  {
    label: "Events",
    href: "/events",
    description: "Campus highlights and public updates.",
    icon: CalendarDays,
  },
  {
    label: "Alumni",
    href: "/alumni",
    description: "Graduate stories, network, and milestones.",
    icon: Users,
  },
  {
    label: "Calendar",
    href: "/academic-calendar",
    description: "Semester dates and planning essentials.",
    icon: CalendarRange,
  },
  {
    label: "Instructors",
    href: "/academic-instructors",
    description: "Faculty directory and profile pages.",
    icon: GraduationCap,
  },
];

const drawerListVariants = {
  closed: {},
  open: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const drawerItemVariants = {
  closed: {
    opacity: 0,
    x: 18,
  },
  open: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    x: 12,
    transition: {
      duration: 0.16,
      ease: [0.4, 0, 1, 1] as const,
    },
  },
};

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
                initial={{ x: "104%", opacity: 0.98, scale: 0.985 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: "106%", opacity: 0.98, scale: 0.985 }}
                transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.9 }}
              >
                <motion.div
                  className="public-drawer-header"
                  variants={drawerItemVariants}
                  initial="closed"
                  animate="open"
                  exit="exit"
                >
                  <div>
                    <p className="public-drawer-kicker">Quick access</p>
                    <h2 className="public-drawer-title">Explore RPI</h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="public-nav-toggle focus-ring inline-flex"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </motion.div>

                <motion.nav
                  className="public-drawer-nav"
                  aria-label="Mobile"
                  variants={drawerListVariants}
                  initial="closed"
                  animate="open"
                  exit="exit"
                >
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div key={link.href} variants={drawerItemVariants}>
                        <Link
                          href={link.href}
                          className={`public-drawer-link ${
                            isActive ? "public-drawer-link-active" : ""
                          }`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={closeMenu}
                        >
                          <span className="public-drawer-link-icon">
                            <link.icon className="h-4 w-4" />
                          </span>
                          <span className="public-drawer-link-copy">
                            <span className="public-drawer-link-label">{link.label}</span>
                            <span className="public-drawer-link-description">
                              {link.description}
                            </span>
                          </span>
                          <ArrowRight className="public-drawer-link-arrow h-4 w-4" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                <motion.div
                  className="public-drawer-footer"
                  variants={drawerItemVariants}
                  initial="closed"
                  animate="open"
                  exit="exit"
                >
                  <div className="public-drawer-action-row">
                    <ThemeToggle className="h-11 w-11 shrink-0 rounded-[1rem] border-[color:color-mix(in_srgb,var(--line)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_88%,transparent)] shadow-[0_14px_28px_rgba(15,23,42,0.08)]" />
                    {role ? (
                      <Link
                        href={dashboardHref(role)}
                        onClick={closeMenu}
                        className="focus-ring inline-flex h-11 items-center justify-center rounded-2xl bg-(--accent) px-4 text-xs font-bold uppercase tracking-[0.16em] text-(--accent-ink) shadow-[0_16px_32px_color-mix(in_srgb,var(--accent)_26%,transparent)] transition hover:brightness-110"
                      >
                        Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className="focus-ring inline-flex h-11 items-center justify-center rounded-2xl bg-(--accent) px-4 text-xs font-bold uppercase tracking-[0.16em] text-(--accent-ink) shadow-[0_16px_32px_color-mix(in_srgb,var(--accent)_26%,transparent)] transition hover:brightness-110"
                      >
                        Portal Login
                      </Link>
                    )}
                  </div>
                </motion.div>
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
    </RealtimeProvider>
  );
}
