import { cookies } from "next/headers";
import Link from "next/link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { RealtimeProvider } from "@/components/providers/realtime-provider";
import { RootNoticeDropdown } from "./root-notice-dropdown";
import { ThemeToggle } from "./theme-toggle";

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
    <header className="border-b border-(--line) bg-(--surface)/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          PMS
        </Link>
        <RealtimeProvider role={role}>
          <div className="flex items-center gap-3">
            <RootNoticeDropdown />
            {role ? <NotificationBell /> : null}
            <ThemeToggle />
            <Link
              href={role ? dashboardHref(role) : "/login"}
              className="focus-ring inline-flex h-10 items-center rounded-lg bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90"
            >
              {role ? "Dashboard" : "Login"}
            </Link>
          </div>
        </RealtimeProvider>
      </nav>
    </header>
  );
}
