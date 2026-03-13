"use client";

import { useEffect, useState } from "react";
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

type Language = "en" | "bn";
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
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [role, setRole] = useState<DashboardRole | undefined>(undefined);

  useEffect(() => {
    const cookieValue = document.cookie
      .split("; ")
      .find((row) => row.startsWith("pms_role="))
      ?.split("=")[1];
    setRole(parseRole(cookieValue));
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const handleChange = () => setIsOpen(false);
    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function toggleLanguage() {
                  {language === "en" ? "EN / ???" : "??? / EN"}
    setLanguage(nextLanguage);
    // TODO: Wire up next-intl or equivalent for real language switching.
  }

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
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="focus-ring inline-flex h-10 items-center rounded-lg border border-(--line) bg-(--surface) px-3 text-xs font-semibold text-(--text) transition hover:bg-(--surface-muted)"
                  aria-label="Toggle language"
                >
                  {language === "en" ? "EN / বাং" : "বাং / EN"}
                </button>
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
                onClick={() => setIsOpen((current) => !current)}
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
              onClick={() => setIsOpen(false)}
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
                  onClick={() => setIsOpen(false)}
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
                      onClick={() => setIsOpen(false)}
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
