import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Megaphone,
  Video,
} from "lucide-react";
import type { Notice } from "@/lib/type/notice";
import type {
  ClassSessionStatus,
  DashboardSummary,
} from "@/lib/type/dashboard/class-session";
import type { AttendanceSummaryRow } from "@/lib/type/dashboard/student-attendance";
import {
  formatTimeRange,
  resolveClassInstructorName,
  resolveClassSubjectTitle,
} from "@/utils/dashboard/class-session";

type StudentOverview = {
  totalClasses: number;
  ongoingClasses: number;
  completedClasses: number;
  currentSemesterLabel: string;
  currentSemesterMeta: string;
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatTime12h(time: string): { clock: string; meridiem: string } {
  const parts = time.trim().split(":");
  const h = parseInt(parts[0] ?? "0", 10);
  const m = parseInt(parts[1] ?? "0", 10);
  if (Number.isNaN(h)) {
    return { clock: "--", meridiem: "" };
  }
  const meridiem = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return { clock: `${hour12}:${pad2(Number.isNaN(m) ? 0 : m)}`, meridiem };
}

function sessionStatusUi(status: ClassSessionStatus): {
  label: string;
  pillClass: string;
  dot?: boolean;
} {
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
          "border border-sky-200/90 bg-sky-50 text-sky-800 dark:border-sky-700/40 dark:bg-sky-950/40 dark:text-sky-100",
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
        label: "Upcoming",
        pillClass:
          "border border-(--line) bg-(--surface-muted) text-(--text-dim)",
      };
  }
}

function attendanceBarClass(row: AttendanceSummaryRow): string {
  if (row.status === "CRITICAL") {
    return "bg-rose-500 dark:bg-rose-400";
  }
  if (row.status === "WARNING") {
    return "bg-amber-500 dark:bg-amber-400";
  }
  return "bg-(--accent)";
}

function todayHeading(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

function averageAttendancePercent(rows: AttendanceSummaryRow[]): number | null {
  if (rows.length === 0) {
    return null;
  }
  const sum = rows.reduce((acc, r) => acc + r.attendancePercentage, 0);
  return Math.round(sum / rows.length);
}

export function StudentDashboard({
  summary,
  overview,
  attendanceSummary,
  highlightNotice,
}: {
  summary: DashboardSummary;
  overview: StudentOverview;
  attendanceSummary: AttendanceSummaryRow[];
  highlightNotice?: Notice | null;
}) {
  const avgAttendance = averageAttendancePercent(attendanceSummary);
  const notice = highlightNotice ?? null;

  return (
    <div className="mx-auto max-w-7xl pb-10 font-(family-name:--font-body)">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-(--text) sm:text-4xl">
          Student Dashboard
        </h1>
        <p className="mt-2 text-lg text-(--text-dim)">
          Personal schedule, attendance health, and academic notices in one place.
        </p>
      </header>

      <section className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          className="rounded-xl p-6 shadow-lg shadow-(--accent)/10"
          style={{
            background: "var(--accent)",
            color: "var(--accent-ink)",
          }}
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] opacity-90">
            Current Semester
          </p>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                {overview.currentSemesterLabel}
              </p>
              <p className="mt-4 text-xs font-medium opacity-90">
                {overview.currentSemesterMeta}
              </p>
            </div>
            <Calendar
              className="h-9 w-9 shrink-0 opacity-90"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>

        <div className="rounded-xl border border-(--line) border-l-4 border-l-(--accent) bg-(--surface) p-6 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-(--text-dim)">
            Total Classes
          </p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold tracking-tight text-(--text)">
              {overview.totalClasses}
            </span>
            <BookOpen
              className="h-9 w-9 text-(--accent)/35"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
          <p className="mt-4 text-xs font-medium text-(--text-dim)">
            All classes for the semester shown here
          </p>
        </div>

        <div className="rounded-xl border border-(--line) border-l-4 border-l-amber-500 bg-(--surface) p-6 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-(--text-dim)">
            Ongoing Classes
          </p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold tracking-tight text-(--text)">
              {overview.ongoingClasses}
            </span>
            <Video className="h-9 w-9 text-amber-500/45" strokeWidth={1.5} aria-hidden />
          </div>
          <p className="mt-4 text-xs font-medium text-(--text-dim)">
            Classes happening right now
          </p>
        </div>

        <div className="rounded-xl border border-(--line) border-l-4 border-l-slate-400 bg-(--surface) p-6 shadow-sm dark:border-l-slate-500">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-(--text-dim)">
            Completed Classes
          </p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold tracking-tight text-(--text)">
              {overview.completedClasses}
            </span>
            <CheckCircle2
              className="h-9 w-9 text-slate-400/55 dark:text-slate-500"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
          <p className="mt-4 text-xs font-medium text-(--text-dim)">
            Classes already finished
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-(--line) bg-(--surface) p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-(--text)">
                  Today&apos;s Classes
                </h2>
                <p className="mt-1 text-sm text-(--text-dim)">{todayHeading()}</p>
              </div>
              <Link
                href="/dashboard/student/classes"
                className="focus-ring inline-flex items-center justify-center rounded-full bg-(--accent) px-6 py-2.5 text-sm font-bold text-(--accent-ink) transition hover:brightness-110"
              >
                Open Classes
              </Link>
            </div>

            <div className="space-y-1">
              {summary.sessions.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarClock
                    className="mx-auto mb-3 h-10 w-10 text-(--text-dim)/50"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <p className="text-sm text-(--text-dim)">No classes scheduled for today.</p>
                </div>
              ) : (
                summary.sessions.map((item) => {
                  const { clock, meridiem } = formatTime12h(item.startTime);
                  const statusUi = sessionStatusUi(item.status);
                  return (
                    <Link
                      key={item._id}
                      href={`/dashboard/student/classes/${item._id}`}
                      className="group flex items-center gap-4 rounded-xl p-4 transition-colors hover:bg-(--surface-muted) sm:gap-6"
                    >
                      <div className="w-14 shrink-0 text-center sm:w-16">
                        <p
                          className={`text-xs font-bold ${item.status === "ONGOING" ? "text-(--accent)" : "text-(--text)"}`}
                        >
                          {clock}
                        </p>
                        {meridiem ? (
                          <p className="text-[10px] font-medium text-(--text-dim)">{meridiem}</p>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-(--text) transition-colors group-hover:text-(--accent)">
                          {resolveClassSubjectTitle(item.subject)}
                        </h3>
                        <p className="text-sm text-(--text-dim)">
                          {resolveClassInstructorName(item.instructor)}
                          {" | "}
                          {formatTimeRange(item.startTime, item.endTime)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${statusUi.pillClass}`}
                        >
                          {statusUi.dot ? (
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500 dark:bg-rose-400" />
                          ) : null}
                          {statusUi.label}
                        </span>
                        <ChevronRight
                          className="h-5 w-5 text-(--text-dim)/40 transition-colors group-hover:text-(--accent)"
                          strokeWidth={2}
                          aria-hidden
                        />
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          <div className="rounded-xl bg-(--surface-muted) p-6 sm:p-8">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-(--text)">
              Academic notice board
            </h2>
            {notice ? (
              <Link
                href={`/notices/${notice._id}`}
                className="focus-ring flex gap-4 rounded-xl bg-(--surface) p-4 transition hover:border-(--line) hover:shadow-sm"
                style={{ border: "1px solid var(--line)" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
                  aria-hidden
                >
                  <Megaphone className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-(--text)">{notice.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-(--text-dim)">
                    {notice.excerpt || notice.content.slice(0, 160)}
                  </p>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-(--accent)">
                    Read notice &gt;
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-(--line) bg-(--surface) px-4 py-10 text-center">
                <BookOpen
                  className="h-8 w-8 text-(--text-dim)/40"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <p className="text-sm text-(--text-dim)">No featured notice right now.</p>
                <Link
                  href="/notices"
                  className="focus-ring text-xs font-bold uppercase tracking-wider text-(--accent) hover:underline"
                >
                  Browse all notices
                </Link>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="rounded-xl border border-(--line) bg-(--surface) p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-bold tracking-tight text-(--text)">
              Attendance summary
            </h2>
            <div className="space-y-6">
              {attendanceSummary.length === 0 ? (
                <p className="text-sm text-(--text-dim)">
                  Attendance will appear here once you are enrolled in active classes.
                </p>
              ) : (
                attendanceSummary.slice(0, 6).map((row) => {
                  const title =
                    typeof row.subject === "string" ? row.subject : row.subject?.title ?? "Subject";
                  const pct = Math.min(100, Math.max(0, row.attendancePercentage));
                  return (
                    <div
                      key={typeof row.subject === "string" ? row.subject : row.subject?._id}
                      className="space-y-2"
                    >
                      <div className="flex items-end justify-between gap-2">
                        <span className="text-sm font-bold text-(--text)">{title}</span>
                        <span className="text-xs font-bold text-(--accent)">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--surface-muted)">
                        <div
                          className={`h-full rounded-full transition-all ${attendanceBarClass(row)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-(--text-dim)">
                        {row.presentCount} / {row.totalClasses} classes present
                      </p>
                    </div>
                  );
                })
              )}
            </div>
            <Link
              href="/dashboard/student/classes"
              className="focus-ring mt-8 flex w-full items-center justify-center rounded-xl border border-(--line) py-3 text-sm font-bold text-(--text-dim) transition hover:bg-(--surface-muted)"
            >
              View detailed report
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-slate-900 p-8 text-white shadow-2xl dark:bg-slate-950">
            <div
              className="pointer-events-none absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-(--accent)/25 blur-3xl"
              aria-hidden
            />
            <h3 className="relative z-10 text-lg font-bold">Overall attendance</h3>
            {avgAttendance != null ? (
              <>
                <p className="relative z-10 mt-2 text-5xl font-extrabold tracking-tight text-sky-300 dark:text-sky-200">
                  {avgAttendance}%
                </p>
                <p className="relative z-10 mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Average across {attendanceSummary.length} subject
                  {attendanceSummary.length === 1 ? "" : "s"} shown above
                </p>
              </>
            ) : (
              <>
                <p className="relative z-10 mt-2 text-3xl font-extrabold tracking-tight text-slate-500">
                  --
                </p>
                <p className="relative z-10 mt-2 text-xs font-medium text-slate-400">
                  Enroll and attend classes to see your blended rate here.
                </p>
              </>
            )}
            <div className="relative z-10 mt-8 flex flex-wrap gap-2">
              <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-bold backdrop-blur-sm">
                Live from your enrollments
              </span>
              <Link
                href="/dashboard/student/semester-enrollments"
                className="focus-ring rounded bg-white/10 px-2 py-1 text-[10px] font-bold backdrop-blur-sm transition hover:bg-white/15"
              >
                Semester enrollments
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
