import { cookies } from "next/headers";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { DashboardProfileMenu } from "@/components/dashboard/sidebar/dashboard-profile-menu";
import { ThemeToggle } from "./theme-toggle";
import { RootNoticeDropdown } from "./root-notice-dropdown";
import { PageShell } from "./page-shell";

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



export async function RootNavbar() {
  const cookieStore = await cookies();
  const role = parseRole(cookieStore.get("pms_role")?.value);

  return (
    <header className="sticky top-0 z-80">
      <nav className="relative w-full border-b border-(--line)/70 bg-(--surface)/72 shadow-[0_18px_42px_rgba(15,23,42,0.1)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),transparent_42%,rgba(75,125,233,0.08))]" />
        <PageShell className="relative z-10 flex w-full items-center justify-between py-3">

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
                Simplified Academic Workflows.
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
                   <DashboardProfileMenu />
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
        </PageShell>
      </nav>
    </header>
  );
}
