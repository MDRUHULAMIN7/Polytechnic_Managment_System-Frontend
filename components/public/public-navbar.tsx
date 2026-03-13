"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  { label: "Home", href: "/" },
  { label: "Notices", href: "/notices" },
  { label: "About", href: "/about" },
  { label: "Admissions", href: "/admissions" },
  { label: "Departments", href: "/departments" },
  { label: "Contact", href: "/contact" },
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="public-nav-inner">
            <Link href="/" className="public-nav-logo">
              RPI Polytechnic
            </Link>

            <nav className="public-nav-links hidden lg:flex" aria-label="Primary">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`public-nav-link ${isActive ? "public-nav-link-active" : ""}`}
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
                    className="hero-cta-primary focus-ring inline-flex h-10 items-center rounded-full px-4 text-xs font-semibold"
                  >
                    Login
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
                onClick={() =>
                  setMenuState((current) => {
                    if (current.path !== pathname) {
                      return { open: true, path: pathname };
                    }

                    return { open: !current.open, path: pathname };
                  })
                }
                aria-label="Open menu"
                aria-expanded={isOpen}
                aria-controls="public-mobile-menu"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
        </div>

        {isOpen ? (
          <div className="public-drawer public-drawer-open">
            <button
              type="button"
              className="public-drawer-backdrop"
              onClick={closeMenu}
              aria-label="Close menu"
            />
            <aside
              id="public-mobile-menu"
              className="public-drawer-panel"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
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
                    className="hero-cta-primary focus-ring inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-semibold"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="hero-cta-primary focus-ring inline-flex h-10 items-center justify-center rounded-full px-4 text-xs font-semibold"
                  >
                    Login
                  </Link>
                )}
              </div>
            </aside>
          </div>
        ) : null}
      </header>
    </RealtimeProvider>
  );
}
