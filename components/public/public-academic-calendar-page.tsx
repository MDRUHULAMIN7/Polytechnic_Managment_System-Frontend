"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Download,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";

type PublicAcademicCalendarPageProps = {
  semesters: AcademicSemester[];
  semesterError: string | null;
  departments: AcademicDepartment[];
  departmentError: string | null;
};

const monthOrder = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
} as const;

function sortSemesters(items: AcademicSemester[]) {
  return [...items].sort((left, right) => {
    const leftYear = Number.parseInt(left.year, 10);
    const rightYear = Number.parseInt(right.year, 10);

    if (Number.isFinite(leftYear) && Number.isFinite(rightYear) && leftYear !== rightYear) {
      return leftYear - rightYear;
    }

    return Number(left.code) - Number(right.code);
  });
}

function semesterDateLabel(semester: AcademicSemester) {
  return `${semester.startMonth} - ${semester.endMonth}`;
}

function semesterYearStart(value: string) {
  const match = value.match(/\d{4}/);
  return match ? Number(match[0]) : Number.NaN;
}

function semesterState(semester: AcademicSemester) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const startYear = semesterYearStart(semester.year);
  const startMonth = monthOrder[semester.startMonth];
  const endMonth = monthOrder[semester.endMonth];

  if (!Number.isFinite(startYear)) {
    return {
      label: "Scheduled",
      className: "calendar-status-scheduled",
      detail: "Planning record available",
    };
  }

  if (startYear === currentYear && currentMonth >= startMonth && currentMonth <= endMonth) {
    return {
      label: "Active",
      className: "calendar-status-active",
      detail: "Current academic window",
    };
  }

  if (startYear > currentYear || (startYear === currentYear && currentMonth < startMonth)) {
    return {
      label: "Upcoming",
      className: "calendar-status-upcoming",
      detail: "Next scheduled cycle",
    };
  }

  return {
    label: "Completed",
    className: "calendar-status-completed",
    detail: "Archived semester window",
  };
}

function semesterNarrative(semester: AcademicSemester) {
  return `The ${semester.name.toLowerCase()} semester is scheduled for ${semesterDateLabel(semester)} in ${semester.year}. Students, faculty, and administration can align planning around this official institutional window.`;
}

function monthNumberLabel(code: string) {
  return code.padStart(2, "0");
}

function instructorName(department: AcademicDepartment) {
  const instructor = department.academicInstructor;

  if (!instructor) {
    return "Lead instructor to be assigned";
  }

  if (typeof instructor === "string") {
    return instructor;
  }

  return instructor.name ?? "Lead instructor to be assigned";
}

function activeSemesterText(semesters: AcademicSemester[]) {
  const active = semesters.find((semester) => semesterState(semester).label === "Active");

  if (!active) {
    return "Semester schedule published";
  }

  return `${active.name} Semester Active`;
}

export function PublicAcademicCalendarPage({
  semesters,
  semesterError,
  departments,
  departmentError,
}: PublicAcademicCalendarPageProps) {
  const sortedSemesters = useMemo(() => sortSemesters(semesters), [semesters]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("all");

  const visibleSemesters = useMemo(() => {
    if (selectedSemesterId === "all") {
      return sortedSemesters;
    }

    return sortedSemesters.filter((semester) => semester._id === selectedSemesterId);
  }, [selectedSemesterId, sortedSemesters]);

  const timelineSemesters = visibleSemesters.length ? visibleSemesters : sortedSemesters;
  const featuredSemester = timelineSemesters[0] ?? sortedSemesters[0] ?? null;
  const contactDepartments = departments.slice(0, 4);
  const currentStatusLabel = activeSemesterText(sortedSemesters);

  return (
    <section className="calendar-page px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="calendar-page-kicker">
                Academic roadmap
                {featuredSemester?.year ? ` ${featuredSemester.year}` : ""}
              </span>
              <h1 className="mt-4 font-display text-5xl font-bold leading-tight tracking-[-0.06em] text-(--text) sm:text-6xl">
                Precision in academic planning.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-(--text-dim)">
                Navigate the official RPI Polytechnic academic timeline using live semester records. Each planning window is aligned to institutional schedules and public-facing updates.
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.24em] text-(--text-dim)">
                Current status
              </span>
              <div className="calendar-status-pill">
                <span className="calendar-status-dot" />
                <span className="text-sm font-semibold text-(--text)">{currentStatusLabel}</span>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="calendar-filter-shell glass-panel border border-[color:color-mix(in_srgb,var(--line)_80%,transparent)] lg:col-span-8">
            <div className="calendar-filter-scroll">
              <button
                type="button"
                onClick={() => setSelectedSemesterId("all")}
                className={`calendar-filter-chip ${selectedSemesterId === "all" ? "calendar-filter-chip-active" : ""}`}
              >
                All Semesters
              </button>
              {sortedSemesters.map((semester) => (
                <button
                  key={semester._id}
                  type="button"
                  onClick={() => setSelectedSemesterId(semester._id)}
                  className={`calendar-filter-chip ${selectedSemesterId === semester._id ? "calendar-filter-chip-active" : ""}`}
                >
                  {semester.name}
                </button>
              ))}
            </div>
          </div>

          <div className="calendar-legend-shell lg:col-span-4">
            <div className="calendar-legend-item">
              <span className="calendar-legend-dot calendar-legend-dot-active" />
              <span>Active</span>
            </div>
            <div className="calendar-legend-item">
              <span className="calendar-legend-dot calendar-legend-dot-upcoming" />
              <span>Upcoming</span>
            </div>
            <div className="calendar-legend-item">
              <span className="calendar-legend-dot calendar-legend-dot-completed" />
              <span>Completed</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-9">
            {semesterError ? (
              <div className="calendar-empty-panel rounded-[2rem] px-6 py-12 text-sm text-(--text-dim)">
                {semesterError}
              </div>
            ) : null}

            {!semesterError && timelineSemesters.length === 0 ? (
              <div className="calendar-empty-panel rounded-[2rem] px-6 py-12 text-sm text-(--text-dim)">
                No academic semester data is available right now.
              </div>
            ) : null}

            {!semesterError && timelineSemesters.length > 0 ? (
              <div className="calendar-timeline relative pl-12 md:pl-24">
                <div className="calendar-timeline-line absolute bottom-0 left-6 top-0 md:left-12" />
                {timelineSemesters.map((semester) => {
                  const status = semesterState(semester);

                  return (
                    <article key={semester._id} className="calendar-timeline-block relative mb-16 last:mb-0">
                      <div className="calendar-timeline-index">
                        {monthNumberLabel(semester.code)}
                      </div>

                      <div className="calendar-timeline-card">
                        <div className="flex flex-col gap-5 border-b border-[color:color-mix(in_srgb,var(--line)_75%,transparent)] pb-6 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className={`calendar-status-chip ${status.className}`}>
                              {status.label}
                            </div>
                            <h3 className="mt-4 font-display text-3xl font-bold tracking-[-0.05em] text-(--text)">
                              {semester.name} Semester
                            </h3>
                            <p className="mt-3 max-w-2xl text-base leading-8 text-(--text-dim)">
                              {semesterNarrative(semester)}
                            </p>
                          </div>

                          <div className="calendar-summary-badge">
                            <span className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-(--text-dim)">
                              Academic year
                            </span>
                            <span className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
                              {semester.year}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="calendar-metric-card">
                            <span className="calendar-metric-label">Code</span>
                            <span className="calendar-metric-value">{semester.code}</span>
                          </div>
                          <div className="calendar-metric-card">
                            <span className="calendar-metric-label">Start month</span>
                            <span className="calendar-metric-value">{semester.startMonth}</span>
                          </div>
                          <div className="calendar-metric-card">
                            <span className="calendar-metric-label">End month</span>
                            <span className="calendar-metric-value">{semester.endMonth}</span>
                          </div>
                          <div className="calendar-metric-card">
                            <span className="calendar-metric-label">Window</span>
                            <span className="calendar-metric-value">{status.detail}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </div>

          <aside className="space-y-8 lg:col-span-3">
            <section className="calendar-download-card relative overflow-hidden rounded-[2rem] p-8 text-white">
              <div className="relative z-10">
                <h3 className="font-display text-3xl font-bold tracking-[-0.05em]">
                  Official schedule
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/78">
                  Review the public calendar, notices, and institutional updates that support semester planning across departments.
                </p>
                <Link
                  href="/notices"
                  className="focus-ring mt-8 inline-flex min-h-12 w-full items-center justify-between rounded-2xl bg-sky-300 px-5 text-sm font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:brightness-105"
                >
                  Browse Notices
                  <Download className="h-4 w-4" />
                </Link>
              </div>
              <div className="calendar-download-glow" />
            </section>

            <section className="calendar-sidebar-card rounded-[2rem] p-8">
              <h3 className="font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
                Department outlook
              </h3>
              <p className="mt-3 text-sm leading-7 text-(--text-dim)">
                Lead instructors and department anchors connected to the public academic experience.
              </p>

              <div className="mt-6 space-y-5">
                {contactDepartments.length ? (
                  contactDepartments.map((department) => (
                    <div key={department._id} className="flex gap-4">
                      <div className="mt-1 h-9 w-9 shrink-0 rounded-2xl bg-[color:color-mix(in_srgb,var(--accent)_10%,transparent)] text-(--accent) flex items-center justify-center">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-(--text-dim)">
                          {department.name}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-(--text)">
                          {instructorName(department)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-7 text-(--text-dim)">
                    {departmentError ?? "Department contacts will appear here when public data is available."}
                  </p>
                )}
              </div>
            </section>

            <section className="calendar-sidebar-card rounded-[2rem] p-8">
              <h3 className="font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
                Calendar cues
              </h3>
              <div className="mt-6 space-y-4">
                <div className="calendar-side-stat">
                  <span className="calendar-side-icon">
                    <CalendarClock className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-(--text)">Live semester windows</p>
                    <p className="mt-1 text-xs leading-6 text-(--text-dim)">
                      Timelines come from academic semester records in the system.
                    </p>
                  </div>
                </div>
                <div className="calendar-side-stat">
                  <span className="calendar-side-icon">
                    <CalendarDays className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-(--text)">Public planning access</p>
                    <p className="mt-1 text-xs leading-6 text-(--text-dim)">
                      Students and visitors can review official windows without logging in.
                    </p>
                  </div>
                </div>
                <div className="calendar-side-stat">
                  <span className="calendar-side-icon">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-(--text)">Institutional consistency</p>
                    <p className="mt-1 text-xs leading-6 text-(--text-dim)">
                      Calendar updates stay aligned with notices, instructors, and semester planning.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <article className="calendar-image-card relative overflow-hidden rounded-[2rem]">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJB5Y5dbRGfqUtBDODZS04Sd8Sti1QAHX4NABXtwUShMqAnLhKxNHrPHsJgBr7NR0c6eWhFNgCBF5L2kU685Dzs1czfv3laNvZPP9rDv3DCK0QHAL5KfM6P1LqKy2keDfAUxzOGb5UpWfrh7tEpddaBcGh0PTQ9gA00AZLyU83gnQnj3W-UTo6su9PAp2yEH7RIJ8ZE58mY1t_ozoDU1VyxixHrNSSYuiDQUgxSsFQ1P6608eCDOgIMGTAgtO9bPQ_gtC4fiUjYGk"
                alt="Academic building facade at RPI Polytechnic"
                fill
                className="object-cover grayscale transition duration-700 hover:grayscale-0"
                sizes="(min-width: 1024px) 24rem, 100vw"
              />
              <div className="calendar-image-overlay absolute inset-0" />
              <div className="relative z-10 flex min-h-[28rem] flex-col justify-end p-8">
                <div className="inline-flex w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/78 backdrop-blur-xl">
                  Institutional calendar
                </div>
                <h3 className="mt-5 font-display text-3xl font-bold tracking-[-0.04em] text-white">
                  Academic planning with clarity
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  Explore semester records, browse official notices, and stay connected to the public academic timeline.
                </p>
                <Link
                  href="/academic-instructors"
                  className="focus-ring mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-200 transition hover:gap-3"
                >
                  Meet Instructors
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </section>
  );
}
