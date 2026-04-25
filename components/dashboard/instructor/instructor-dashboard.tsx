import Link from "next/link";
import {
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import type {
  ClassSession,
  ClassSessionStatus,
  DashboardSummary,
} from "@/lib/type/dashboard/class-session";
import {
  formatTimeRange,
  resolveClassSubjectTitle,
} from "@/utils/dashboard/class-session";

export type InstructorTeachingAssignment = {
  id: string;
  subjectLabel: string;
  semesterLabel: string;
  registrationMeta: string;
  scheduleLabel: string;
  detailHref: string;
};

export type InstructorSemesterCoverage = {
  label: string;
  offeringCount: number;
  registrationCount: number;
  isCurrent: boolean;
  meta: string;
};

export type InstructorDashboardOverview = {
  assignedSubjects: number;
  assignedSemesters: number;
  assignedRegistrations: number;
  assignedOfferings: number;
  scheduledClasses: number;
  completedClasses: number;
  liveClasses: number;
  teachingAssignments: InstructorTeachingAssignment[];
  semesterCoverage: InstructorSemesterCoverage[];
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatTime12h(time: string): { clock: string; meridiem: string } {
  const parts = time.trim().split(":");
  const hour = parseInt(parts[0] ?? "0", 10);
  const minute = parseInt(parts[1] ?? "0", 10);

  if (Number.isNaN(hour)) {
    return { clock: "--", meridiem: "" };
  }

  const meridiem = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return {
    clock: `${hour12}:${pad2(Number.isNaN(minute) ? 0 : minute)}`,
    meridiem,
  };
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
        label: "Scheduled",
        pillClass:
          "border border-(--line) bg-(--surface-muted) text-(--text-dim)",
      };
  }
}

function todayHeading(): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());
}

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

export function InstructorDashboard({
  overview,
  todayClasses,
}: {
  summary: DashboardSummary;
  overview: InstructorDashboardOverview;
  todayClasses: ClassSession[];
}) {
  return (
    <div className="mx-auto max-w-7xl pb-10 font-(family-name:--font-body)">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-(--text) sm:text-4xl">
          Instructor Dashboard
        </h1>
        <p className="mt-2 text-lg text-(--text-dim)">
          Track teaching load, assigned semesters, and today&apos;s classroom flow in one place.
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
            Assigned Subjects
          </p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold tracking-tight">
              {overview.assignedSubjects}
            </span>
            <BookOpen className="h-9 w-9 opacity-90" strokeWidth={1.75} aria-hidden />
          </div>
          <p className="mt-4 text-xs font-medium opacity-90">
            Unique subjects currently mapped to your teaching role
          </p>
        </div>

        <div className="rounded-xl border border-(--line) border-l-4 border-l-(--accent) bg-(--surface) p-6 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-(--text-dim)">
            Assigned Semesters
          </p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold tracking-tight text-(--text)">
              {overview.assignedSemesters}
            </span>
            <Calendar
              className="h-9 w-9 text-(--accent)/35"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
          <p className="mt-4 text-xs font-medium text-(--text-dim)">
            {pluralize(overview.assignedRegistrations, "registration window")} covered
          </p>
        </div>

        <div className="rounded-xl border border-(--line) border-l-4 border-l-amber-500 bg-(--surface) p-6 shadow-sm">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.05em] text-(--text-dim)">
            Scheduled Classes
          </p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-extrabold tracking-tight text-(--text)">
              {overview.scheduledClasses}
            </span>
            <CalendarClock
              className="h-9 w-9 text-amber-500/45"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
          <p className="mt-4 text-xs font-medium text-(--text-dim)">
            Upcoming classes across all your current teaching assignments
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
            Classes successfully delivered so far
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-(--line) bg-(--surface) p-6 shadow-sm sm:p-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-(--text)">
                  Today&apos;s Teaching Queue
                </h2>
                <p className="mt-1 text-sm text-(--text-dim)">{todayHeading()}</p>
              </div>
              <Link
                href="/dashboard/instructor/classes"
                className="focus-ring inline-flex items-center justify-center rounded-full bg-(--accent) px-6 py-2.5 text-sm font-bold text-(--accent-ink) transition hover:brightness-110"
              >
                Open Class List
              </Link>
            </div>

            <div className="space-y-1">
              {todayClasses.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarClock
                    className="mx-auto mb-3 h-10 w-10 text-(--text-dim)/50"
                    strokeWidth={1.25}
                    aria-hidden
                  />
                  <p className="text-sm text-(--text-dim)">No classes scheduled for today.</p>
                </div>
              ) : (
                todayClasses.map((item) => {
                  const { clock, meridiem } = formatTime12h(item.startTime);
                  const statusUi = sessionStatusUi(item.status);

                  return (
                    <Link
                      key={item._id}
                      href={`/dashboard/instructor/classes/${item._id}`}
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
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-(--text)">
                  Teaching Assignments
                </h2>
                <p className="mt-1 text-sm text-(--text-dim)">
                  Recent offered subjects assigned to you across semesters.
                </p>
              </div>
              <Link
                href="/dashboard/instructor/offered-subjects?scope=my"
                className="focus-ring inline-flex items-center justify-center rounded-full border border-(--line) px-5 py-2.5 text-sm font-bold text-(--text-dim) transition hover:bg-(--surface)"
              >
                View Offered Subjects
              </Link>
            </div>

            {overview.teachingAssignments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-(--line) bg-(--surface) px-4 py-10 text-center">
                <BookOpen
                  className="mx-auto mb-3 h-8 w-8 text-(--text-dim)/40"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <p className="text-sm text-(--text-dim)">
                  No teaching assignments are available yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {overview.teachingAssignments.map((item) => (
                  <Link
                    key={item.id}
                    href={item.detailHref}
                    className="focus-ring flex items-start justify-between gap-4 rounded-xl bg-(--surface) p-4 transition hover:border-(--line) hover:shadow-sm"
                    style={{ border: "1px solid var(--line)" }}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-(--text)">{item.subjectLabel}</p>
                      <p className="mt-1 text-sm text-(--text-dim)">{item.semesterLabel}</p>
                      <p className="mt-1 text-xs text-(--text-dim)">{item.scheduleLabel}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-(--surface-muted) px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-(--text-dim)">
                      {item.registrationMeta}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="rounded-xl border border-(--line) bg-(--surface) p-6 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight text-(--text)">
                Semester Coverage
              </h2>
              <p className="mt-1 text-sm text-(--text-dim)">
                Where your current teaching assignments are distributed.
              </p>
            </div>

            <div className="space-y-4">
              {overview.semesterCoverage.length === 0 ? (
                <p className="text-sm text-(--text-dim)">
                  Semester coverage will appear once subjects are assigned to you.
                </p>
              ) : (
                overview.semesterCoverage.slice(0, 5).map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-(--text)">{item.label}</p>
                        <p className="mt-1 text-xs text-(--text-dim)">{item.meta}</p>
                      </div>
                      {item.isCurrent ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                          Current
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              href="/dashboard/instructor/offered-subjects?scope=my"
              className="focus-ring mt-8 flex w-full items-center justify-center rounded-xl border border-(--line) py-3 text-sm font-bold text-(--text-dim) transition hover:bg-(--surface-muted)"
            >
              Review All Assignments
            </Link>
          </div>

        </aside>
      </div>
    </div>
  );
}
