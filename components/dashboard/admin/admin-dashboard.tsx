import Link from "next/link";
import type { CSSProperties } from "react";
import {
  BookMarked,
  CalendarRange,
  ChevronRight,
  GraduationCap,
  Layers3,
  LibraryBig,
  Radio,
  ShieldCheck,
  Users,
} from "lucide-react";
import type {
  ClassSessionStatus,
  DashboardSummary,
} from "@/lib/type/dashboard/class-session";
import { AdminDashboardCharts } from "@/components/dashboard/admin/admin-dashboard-charts";
import type {
  AdminDashboardCardTone,
  AdminDashboardOverview,
} from "@/components/dashboard/admin/admin-dashboard-types";
import {
  formatClassDate,
  formatTimeRange,
  resolveClassInstructorName,
  resolveClassSubjectTitle,
} from "@/utils/dashboard/class-session";

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function adminStatusPillClass(status: "active" | "blocked") {
  if (status === "blocked") {
    return "border border-rose-200/90 bg-rose-50 text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/35 dark:text-rose-100";
  }

  return "border border-emerald-200/90 bg-emerald-50 text-emerald-800 dark:border-emerald-700/40 dark:bg-emerald-950/35 dark:text-emerald-100";
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: value >= 1000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1000 ? 1 : 0,
  }).format(value);
}

function toneCardClass(
  tone: AdminDashboardCardTone,
): {
  wrapper: string;
  iconClass: string;
  helperClass: string;
  style?: CSSProperties;
} {
  switch (tone) {
    case "primary":
      return {
        wrapper:
          "border-transparent text-(--accent-ink) shadow-lg shadow-(--accent)/10",
        style: {
          background: "var(--accent)",
        },
        iconClass: "bg-white/15 text-white",
        helperClass: "text-white/80",
      };
    case "amber":
      return {
        wrapper:
          "border-(--line) border-l-4 border-l-amber-500 bg-(--surface) text-(--text)",
        iconClass:
          "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
        helperClass: "text-(--text-dim)",
      };
    case "emerald":
      return {
        wrapper:
          "border-(--line) border-l-4 border-l-emerald-500 bg-(--surface) text-(--text)",
        iconClass:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
        helperClass: "text-(--text-dim)",
      };
    case "sky":
      return {
        wrapper:
          "border-(--line) border-l-4 border-l-sky-500 bg-(--surface) text-(--text)",
        iconClass:
          "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200",
        helperClass: "text-(--text-dim)",
      };
    case "slate":
      return {
        wrapper:
          "border-(--line) border-l-4 border-l-slate-400 bg-(--surface) text-(--text) dark:border-l-slate-500",
        iconClass:
          "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-200",
        helperClass: "text-(--text-dim)",
      };
    default:
      return {
        wrapper:
          "border-(--line) border-l-4 border-l-(--accent) bg-(--surface) text-(--text)",
        iconClass: "bg-(--surface-muted) text-(--accent)",
        helperClass: "text-(--text-dim)",
      };
  }
}

function cardIcon(label: string) {
  switch (label) {
    case "Total Students":
      return GraduationCap;
    case "Total Instructors":
      return Users;
    case "Subject Catalog":
      return LibraryBig;
    case "Offered Subjects":
      return BookMarked;
    case "Semester Windows":
      return CalendarRange;
    case "Academic Semesters":
      return Layers3;
    default:
      return ShieldCheck;
  }
}

function sessionStatusUi(status: ClassSessionStatus) {
  switch (status) {
    case "ONGOING":
      return {
        label: "Live",
        pillClass:
          "border border-rose-200/90 bg-rose-50 text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/35 dark:text-rose-100",
        dot: true,
      };
    case "COMPLETED":
      return {
        label: "Completed",
        pillClass:
          "border border-emerald-200/90 bg-emerald-50 text-emerald-800 dark:border-emerald-700/40 dark:bg-emerald-950/35 dark:text-emerald-100",
      };
    case "CANCELLED":
      return {
        label: "Cancelled",
        pillClass:
          "border border-slate-200 bg-slate-100 text-slate-600 dark:border-(--line) dark:bg-(--surface-muted) dark:text-(--text-dim)",
      };
    case "MISSED":
      return {
        label: "Missed",
        pillClass:
          "border border-amber-200/90 bg-amber-50 text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/35 dark:text-amber-100",
      };
    default:
      return {
        label: "Scheduled",
        pillClass:
          "border border-sky-200/90 bg-sky-50 text-sky-800 dark:border-sky-700/40 dark:bg-sky-950/40 dark:text-sky-100",
      };
  }
}

function todayHeading() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

export function AdminDashboard({
  summary,
  overview,
}: {
  summary: DashboardSummary;
  overview: AdminDashboardOverview;
}) {
  const todayDisrupted = summary.sessions.filter(
    (item) => item.status === "CANCELLED" || item.status === "MISSED",
  ).length;
  const isSuperAdminView = Boolean(overview.superAdmin);

  return (
    <div className="admin-overview-theme mx-auto max-w-7xl pb-10 font-(family-name:--font-body)">
      <header className="mb-10">
        <p className="admin-overview-accent text-xs font-bold uppercase tracking-[0.28em] text-(--accent)">
          {isSuperAdminView ? "Super Admin Overview" : "Admin Overview"}
        </p>
        <h1 className="admin-overview-heading mt-3 text-2xl font-bold tracking-tight text-(--text) sm:text-3xl capitalize">
          {isSuperAdminView
            ? "Centralize access, teams, and academic operations."
            : "Platform command center for delivery, offerings, and operations."}
        </h1>

      </header>

      <section className="admin-overview-panel-soft relative overflow-hidden rounded-4xl border border-(--line) px-6 py-7 shadow-sm sm:px-8 sm:py-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)]">
          <div>
            <span className="admin-overview-pill inline-flex rounded-full border border-(--line) bg-(--surface) px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-(--text-dim)">
              Control Tower
            </span>
            <h2 className="admin-overview-heading mt-5 text-xl font-bold tracking-tight text-(--text) sm:text-2xl">
              Live platform health, semester distribution, and teaching pulse.
            </h2>
            <p className="admin-overview-body mt-3 max-w-2xl text-sm leading-7 text-(--text-dim) sm:text-base">
              The cards below capture platform inventory, while the charts and semester map help
              you spot delivery bottlenecks, registration pressure, and offering concentration.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {overview.quickMetrics.map((item) => (
                <div
                  key={item.label}
                  className="admin-overview-nested rounded-2xl border border-(--line) bg-(--surface) px-4 py-4 shadow-sm"
                >
                  <p className="admin-overview-body text-[11px] font-bold uppercase tracking-[0.22em] text-(--text-dim)">
                    {item.label}
                  </p>
                  <p className="admin-overview-value mt-2 text-2xl font-extrabold tracking-tight text-(--text)">
                    {item.value}
                  </p>
                  <p className="admin-overview-body mt-2 text-xs text-(--text-dim)">{item.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-overview-panel rounded-[1.75rem] border border-(--line) bg-(--surface) p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="admin-overview-accent text-xs font-bold uppercase tracking-[0.22em] text-(--accent)">
                  Today Snapshot
                </p>
                <h3 className="admin-overview-heading mt-3 text-xl font-bold tracking-tight text-(--text)">
                  Classroom operations for {todayHeading()}
                </h3>
              </div>
              <span className="admin-overview-nested admin-overview-accent inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-muted) text-(--accent)">
                <Radio className="h-5 w-5" strokeWidth={1.9} aria-hidden />
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["Scheduled", summary.scheduled],
                ["Live", summary.ongoing],
                ["Completed", summary.completed],
                ["Disrupted", todayDisrupted],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="admin-overview-nested rounded-2xl border border-(--line) bg-(--surface-muted) px-4 py-4"
                >
                  <p className="admin-overview-body text-[11px] font-bold uppercase tracking-[0.18em] text-(--text-dim)">
                    {label}
                  </p>
                  <p className="admin-overview-value mt-2 text-3xl font-extrabold tracking-tight text-(--text)">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/admin/classes"
                className="focus-ring inline-flex items-center justify-center rounded-full bg-(--accent) px-5 py-2.5 text-sm font-bold text-(--accent-ink) transition hover:brightness-110"
              >
                Open Class Monitor
              </Link>
              <Link
                href="/dashboard/admin/offered-subjects"
                className="focus-ring inline-flex items-center justify-center rounded-full border border-(--line) px-5 py-2.5 text-sm font-bold text-(--text-dim) transition hover:bg-(--surface-muted)"
              >
                Review Offerings
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {overview.cards.map((item) => {
          const tone = toneCardClass(item.tone);
          const Icon = cardIcon(item.label);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`focus-ring rounded-3xl border p-6 shadow-sm transition-transform hover:-translate-y-1 ${item.tone === "primary" ? "" : "admin-overview-panel"} ${tone.wrapper}`}
              style={tone.style}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p
                    className={`admin-overview-body text-xs font-bold uppercase tracking-[0.18em] ${
                      item.tone === "primary" ? "text-white/80" : "text-(--text-dim)"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className={`mt-3 text-4xl font-extrabold tracking-tight ${item.tone === "primary" ? "" : "admin-overview-value"}`}>
                    {formatCompactNumber(item.value)}
                  </p>
                </div>
                <span
                  className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.tone === "primary" ? "" : "admin-overview-nested"} ${tone.iconClass}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
              </div>
              <p className={`mt-4 text-sm leading-6 ${item.tone === "primary" ? "" : "admin-overview-body"} ${tone.helperClass}`}>{item.helper}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-12 grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.95fr)]">
        <AdminDashboardCharts overview={overview} />

        <aside className="space-y-8">
          {overview.superAdmin ? (
            <div className="admin-overview-panel rounded-3xl border border-(--line) bg-(--surface) p-6 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="admin-overview-heading text-xl font-bold tracking-tight text-(--text)">
                    Admin Leadership
                  </h2>
                  <p className="admin-overview-body mt-1 text-sm text-(--text-dim)">
                    Recent privileged accounts and their access state across the platform.
                  </p>
                </div>
                <Link
                  href="/dashboard/admin/admins"
                  className="focus-ring inline-flex items-center justify-center rounded-full border border-(--line) px-4 py-2 text-xs font-bold text-(--text-dim) transition hover:bg-(--surface-muted)"
                >
                  Manage Admins
                </Link>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-2">
                {[
                  ["Users", overview.superAdmin.totalUsers],
                  ["Active", overview.superAdmin.activeUsers],
                  ["Blocked", overview.superAdmin.blockedUsers],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="admin-overview-nested rounded-2xl border border-(--line) bg-(--surface-muted) px-3 py-3"
                  >
                    <p className="admin-overview-body text-[10px] font-bold uppercase tracking-[0.18em] text-(--text-dim)">
                      {label}
                    </p>
                    <p className="admin-overview-value mt-1 text-xl font-extrabold tracking-tight text-(--text)">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {overview.superAdmin.adminProfiles.length === 0 ? (
                <div className="admin-overview-nested rounded-2xl border border-dashed border-(--line) bg-(--surface-muted) px-5 py-10 text-center text-sm text-(--text-dim)">
                  Admin profiles will appear here once privileged accounts are available.
                </div>
              ) : (
                <div className="space-y-3">
                  {overview.superAdmin.adminProfiles.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="admin-overview-panel admin-overview-hover focus-ring flex items-center gap-4 rounded-2xl border border-(--line) px-4 py-4 transition-colors hover:bg-(--surface-muted)"
                    >
                      <div className="admin-overview-nested flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-(--line) bg-(--surface-muted) text-sm font-extrabold text-(--accent)">
                        {initialsFromName(item.name) || "AD"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="admin-overview-heading truncate font-bold text-(--text)">
                          {item.name}
                        </p>
                        <p className="admin-overview-body mt-1 truncate text-xs text-(--text-dim)">
                          {item.designation}
                        </p>
                        <p className="admin-overview-body truncate text-xs text-(--text-dim)">
                          {item.email}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${adminStatusPillClass(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          <div className="admin-overview-panel rounded-3xl border border-(--line) bg-(--surface) p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="admin-overview-heading text-xl font-bold tracking-tight text-(--text)">
                  Website Statistics
                </h2>
                <p className="admin-overview-body mt-1 text-sm text-(--text-dim)">
                  Ratios and operational indicators for executive tracking.
                </p>
              </div>
              <span className="admin-overview-nested admin-overview-accent inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-(--surface-muted) text-(--accent)">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              </span>
            </div>

            <div className="space-y-3">
              {overview.websiteStats.map((item) => (
                <div
                  key={item.label}
                  className="admin-overview-nested rounded-2xl border border-(--line) bg-(--surface-muted) px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="admin-overview-heading text-sm font-semibold text-(--text)">{item.label}</p>
                      <p className="admin-overview-body mt-1 text-xs leading-5 text-(--text-dim)">{item.helper}</p>
                    </div>
                    <span className="admin-overview-accent shrink-0 text-lg font-extrabold tracking-tight text-(--accent)">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-overview-panel rounded-3xl border border-(--line) bg-(--surface) p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="admin-overview-heading text-xl font-bold tracking-tight text-(--text)">
                Semester Coverage
              </h2>
              <p className="admin-overview-body mt-1 text-sm text-(--text-dim)">
                The busiest academic semesters by offered subject volume and faculty distribution.
              </p>
            </div>

            {overview.semesterInsights.length === 0 ? (
              <div className="admin-overview-nested rounded-2xl border border-dashed border-(--line) bg-(--surface-muted) px-5 py-10 text-center text-sm text-(--text-dim)">
                Semester coverage will appear once offered subjects are available.
              </div>
            ) : (
              <div className="space-y-3">
                {overview.semesterInsights.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="admin-overview-nested admin-overview-hover focus-ring block rounded-2xl border border-(--line) bg-(--surface-muted) p-4 transition hover:bg-(--surface)"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="admin-overview-heading font-bold text-(--text)">{item.label}</p>
                        <p className="admin-overview-body mt-1 text-xs leading-5 text-(--text-dim)">{item.meta}</p>
                      </div>
                      {item.currentWindows > 0 ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                          Current
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ["Offerings", item.offeredSubjects],
                        ["Subjects", item.uniqueSubjects],
                        ["Faculty", item.uniqueInstructors],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="admin-overview-panel rounded-xl border border-(--line) bg-(--surface) px-3 py-3"
                        >
                          <p className="admin-overview-body text-[10px] font-bold uppercase tracking-[0.16em] text-(--text-dim)">
                            {label}
                          </p>
                          <p className="admin-overview-value mt-1 text-lg font-extrabold tracking-tight text-(--text)">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </section>

      <section className="admin-overview-panel mt-12 rounded-3xl border border-(--line) bg-(--surface) p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="admin-overview-heading text-2xl font-bold tracking-tight text-(--text)">
              Today&apos;s Class Monitor
            </h2>
            <p className="admin-overview-body mt-1 text-sm text-(--text-dim)">
              Jump into attendance and delivery details for the day&apos;s active schedule.
            </p>
          </div>
          <Link
            href="/dashboard/admin/classes"
            className="focus-ring inline-flex items-center justify-center rounded-full border border-(--line) px-5 py-2.5 text-sm font-bold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Open Full Monitor
          </Link>
        </div>

        <div className="space-y-3">
          {summary.sessions.length === 0 ? (
            <div className="admin-overview-nested rounded-2xl border border-dashed border-(--line) bg-(--surface-muted) px-5 py-12 text-center text-sm text-(--text-dim)">
              No classes are scheduled for today.
            </div>
          ) : (
            summary.sessions.slice(0, 6).map((item) => {
              const statusUi = sessionStatusUi(item.status);

              return (
                <Link
                  key={item._id}
                  href={`/dashboard/admin/classes/${item._id}`}
                  className="admin-overview-panel admin-overview-hover focus-ring group flex flex-col gap-3 rounded-2xl border border-(--line) px-4 py-4 transition-colors hover:bg-(--surface-muted) sm:px-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="admin-overview-heading font-bold text-(--text) transition-colors group-hover:text-(--accent)">
                        {resolveClassSubjectTitle(item.subject)}
                      </p>
                      <p className="admin-overview-body mt-1 text-sm text-(--text-dim)">
                        {resolveClassInstructorName(item.instructor)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusUi.pillClass}`}
                      >
                        {statusUi.dot ? (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500 dark:bg-rose-400" />
                        ) : null}
                        {statusUi.label}
                      </span>
                      <ChevronRight
                        className="h-5 w-5 text-(--text-dim)/45 transition-colors group-hover:text-(--accent)"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                  </div>

                  <p className="admin-overview-body text-sm text-(--text-dim)">
                    {formatClassDate(item.date)} | {formatTimeRange(item.startTime, item.endTime)}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
