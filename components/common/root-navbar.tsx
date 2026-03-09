import { cookies } from "next/headers";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { DashboardProfileMenu } from "@/components/dashboard/sidebar/dashboard-profile-menu";
import { ThemeToggle } from "./theme-toggle";
import { RootNoticeDropdown } from "./root-notice-dropdown";
import { RootMobileProfileMenu } from "./root-mobile-profile-menu";

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

function dashboardHref(role: DashboardRole) {
  if (role === "student") {
    return "/dashboard/student";
  }

  if (role === "instructor") {
    return "/dashboard/instructor";
  }

  return "/dashboard/admin";
}

export async function RootNavbar() {
  const cookieStore = await cookies();
  const role = parseRole(cookieStore.get("pms_role")?.value);

  return (
    <header className="sticky top-0 z-[80] px-3 py-3 sm:px-5">
      <div className="mx-auto max-w-6xl">
        <nav className="relative flex w-full items-center justify-between overflow-visible rounded-[1.75rem] border border-(--line)/70 bg-(--surface)/72 px-4 py-3 shadow-[0_18px_42px_rgba(15,23,42,0.1)] backdrop-blur-2xl sm:px-5">
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_42%,rgba(75,125,233,0.08))]" />

          <Link
            href="/"
            className="relative inline-flex min-w-0 items-center gap-3 text-sm font-semibold tracking-tight text-(--text)"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.95),rgba(37,99,235,0.68))] text-xs font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.35)]">
              PMS
            </span>
            <span className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="truncate text-[13px] font-semibold">
                Polytechnic Management
              </span>
              <span className="truncate text-[11px] font-normal text-(--text-dim)">
                Academic and admin workflows, simplified.
              </span>
            </span>
          </Link>

          <RealtimeProvider role={role}>
            {role ? (
              <>
                <div className="relative hidden items-center gap-2 sm:flex">
                  <RootNoticeDropdown />
                  <NotificationBell />
                  <ThemeToggle />
                  <DashboardProfileMenu />
                </div>
                <div className="relative flex items-center gap-2 sm:hidden">
                  <RootNoticeDropdown compact />
                  <NotificationBell />
                  <ThemeToggle />
                  <RootMobileProfileMenu dashboardHref={dashboardHref(role)} />
                </div>
              </>
            ) : (
              <div className="relative flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <Link
                  href="/login"
                  className="focus-ring inline-flex h-10 items-center rounded-full bg-(--accent) px-4 text-xs font-semibold text-(--accent-ink) shadow-[0_12px_26px_rgba(37,99,235,0.28)] transition hover:brightness-110 sm:text-sm"
                >
                  Login
                </Link>
              </div>
            )}
          </RealtimeProvider>
        </nav>
      </div>
    </header>
  );
}
