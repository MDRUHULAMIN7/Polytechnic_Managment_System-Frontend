import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CalendarDays, ClipboardList, Sparkles } from "lucide-react";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { PublicPageMotion } from "@/components/public/public-page-motion";
import { getPublicAcademicDepartments } from "@/lib/api/public/academic-department";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";

export const metadata: Metadata = {
  title: "Academic Calendar",
  description: "Key academic dates, timelines, and department planning at a glance.",
};

const calendarHighlights = [
  {
    title: "Admissions and orientation",
    timeframe: "January - February",
    description: "Admissions, onboarding, and student orientation across departments.",
    icon: ClipboardList,
  },
  {
    title: "Semester schedule",
    timeframe: "March - June",
    description: "Teaching weeks, lab slots, and midterm assessments.",
    icon: CalendarDays,
  },
  {
    title: "Final assessments",
    timeframe: "June - July",
    description: "Final exams, grading windows, and result publication.",
    icon: Sparkles,
  },
  {
    title: "Planning approvals",
    timeframe: "Year-round",
    description: "Department timeline approvals and holiday synchronization.",
    icon: CalendarCheck,
  },
];

const calendarRules = [
  "All dates are approved before publishing.",
  "Updates are logged with the reason and timestamp.",
  "Departments can add localized notes for their cohorts.",
];

const planningMetrics = [
  { value: "Approved", label: "Publishing flow" },
  { value: "Weekly", label: "Refresh cadence" },
  { value: "Public", label: "Visibility" },
];

function readInstructorName(department: AcademicDepartment) {
  const instructor = department.academicInstructor;
  if (!instructor) {
    return null;
  }
  if (typeof instructor === "string") {
    return instructor;
  }
  return instructor.name ?? null;
}

export default async function AcademicCalendarPage() {
  let departments: AcademicDepartment[] = [];
  let departmentError: string | null = null;
  const stats = [
    { value: "24/7", label: "Public access" },
    { value: "4", label: "Core phases" },
    { value: "Weekly", label: "Calendar refresh" },
  ];

  try {
    const payload = await getPublicAcademicDepartments({
      page: 1,
      limit: 12,
      sort: "name",
    });
    departments = payload.result;
  } catch (error) {
    departmentError =
      error instanceof Error ? error.message : "Failed to load departments.";
  }

  const departmentCount = departments.length;
  const departmentStat = departmentCount ? `${departmentCount}` : "N/A";

  return (
    <PublicPageMotion>
      <main className="min-h-screen bg-(--bg) text-(--text)">
        <PublicPageHero
          badge="Academic calendar"
          title="Academic dates that keep every department aligned."
          description="Publish critical academic milestones once and keep students, instructors, and leadership on the same page."
          imageUrl="https://images.unsplash.com/photo-1763890699288-e34cad0e221f?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=1600"
          imageAlt="University campus courtyard"
          tags={["Public schedule", "Department-led", "Live updates"]}
          stats={[{ value: departmentStat, label: "Departments" }, ...stats]}
          note={{
            title: "Official calendar",
            description: "Dates are approved by academic leadership before publishing.",
          }}
          primaryCta={{ href: "/notices", label: "View public notices" }}
          secondaryCta={{ href: "/academic-instructors", label: "Instructor directory" }}
        />

        <section className="public-section landing-band-soft" data-animate-section>
          <div className="public-shell">
            <div className="public-split">
              <div>
                <div className="public-section-head" data-animate="heading">
                  <div>
                    <span className="public-kicker">Calendar overview</span>
                    <h2 className="public-section-title">
                      A clear rhythm for every semester.
                    </h2>
                    <p className="public-section-subtitle">
                      Students see what matters now, departments plan ahead, and instructors
                      stay aligned with assessment windows.
                    </p>
                  </div>
                  <Link href="/events" className="text-sm font-semibold text-(--accent)">
                    See campus events
                  </Link>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {calendarHighlights.map((item) => (
                    <article key={item.title} className="public-card" data-animate-item>
                      <span className="landing-icon">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-(--text-dim)">
                        {item.timeframe}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-(--text)">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-(--text-dim)">
                        {item.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="public-panel" data-animate-item>
                <p className="public-panel-title">Publishing rules</p>
                <p className="public-panel-text">
                  Everyone reads the same calendar, but updates stay accountable.
                </p>
                <ul className="public-panel-list">
                  {calendarRules.map((item) => (
                    <li key={item} className="public-panel-item">
                      <span className="public-panel-dot" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="public-metrics">
                  {planningMetrics.map((metric) => (
                    <div key={metric.label} className="public-metric">
                      <span className="public-metric-value">{metric.value}</span>
                      <span className="public-metric-label">{metric.label}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="public-section" data-animate-section>
          <div className="public-shell">
            <div className="public-section-head" data-animate="heading">
              <div>
                <span className="public-kicker">Departments</span>
                <h2 className="public-section-title">
                  Department calendars with accountable leadership.
                </h2>
                <p className="public-section-subtitle">
                  Each department stays visible with the assigned academic instructor and
                  approved timeline.
                </p>
              </div>
              <Link
                href="/academic-instructors"
                className="text-sm font-semibold text-(--accent)"
              >
                View all instructors
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {departments.map((department) => (
                <article key={department._id} className="public-card" data-animate-item>
                  <h3 className="text-lg font-semibold text-(--text)">
                    {department.name}
                  </h3>
                  <p className="mt-2 text-sm text-(--text-dim)">
                    {readInstructorName(department)
                      ? `Lead instructor: ${readInstructorName(department)}`
                      : "Lead instructor to be assigned."}
                  </p>
                </article>
              ))}
              {!departments.length && (
                <div className="public-card md:col-span-2 xl:col-span-3" data-animate-item>
                  <p className="text-sm text-(--text-dim)">
                    {departmentError ??
                      "No departments are available yet. Please check back soon."}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-10 public-cta" data-animate-item>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-(--text)">
                    Need the official calendar PDF?
                  </p>
                  <p className="mt-2 text-sm text-(--text-dim)">
                    Exportable formats and downloadable schedules can be enabled for each
                    department.
                  </p>
                </div>
                <Link href="/notices" className="text-sm font-semibold text-(--accent)">
                  Contact administration
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPageMotion>
  );
}
