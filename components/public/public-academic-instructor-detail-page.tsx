/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, Mail, UserSquare2 } from "lucide-react";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

type PublicAcademicInstructorDetailPageProps = {
  instructor: Instructor | null;
  error: string | null;
};

function fullNameFromInstructor(instructor: Instructor) {
  return [
    instructor.name.firstName,
    instructor.name.middleName,
    instructor.name.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function resolveDepartmentName(department?: AcademicDepartment | string) {
  if (!department) {
    return "Department not published";
  }

  if (typeof department === "string") {
    return department;
  }

  return department.name ?? "Department not published";
}

function monogramFromName(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return "--";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDateLabel(value?: string) {
  if (!value) {
    return "Public record";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Public record";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function PublicAcademicInstructorDetailPage({
  instructor,
  error,
}: PublicAcademicInstructorDetailPageProps) {
  if (!instructor) {
    return (
      <section className="instructor-directory-page px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-screen-xl">
          <div className="instructor-empty-state">
            <p className="text-base font-semibold text-(--text)">
              Instructor profile is not available.
            </p>
            <p className="mt-3 text-sm leading-7 text-(--text-dim)">
              {error ?? "This instructor record could not be found."}
            </p>
            <Link
              href="/academic-instructors"
              className="focus-ring mt-6 inline-flex min-h-12 items-center rounded-full bg-(--accent) px-6 text-xs font-bold uppercase tracking-[0.18em] text-(--accent-ink) transition hover:brightness-110"
            >
              Back to directory
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const fullName = fullNameFromInstructor(instructor);
  const department = resolveDepartmentName(instructor.academicDepartment);
  const monogram = monogramFromName(fullName);

  return (
    <section className="instructor-directory-page px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-8">
          <Link
            href="/academic-instructors"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-(--text-dim) transition hover:text-(--accent)"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to directory
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <article className="instructor-detail-hero">
            <div className="instructor-detail-hero-grid" />
            <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
              <div className="instructor-detail-portrait">
                {instructor.profileImg ? (
                  <img
                    src={instructor.profileImg}
                    alt={fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="instructor-detail-portrait-fallback">{monogram}</div>
                )}
              </div>

              <div className="flex-1">
                <span className="instructor-page-kicker text-sky-200/82">
                  Faculty directory profile
                </span>
                <h1 className="mt-5 font-display text-5xl font-bold leading-[0.96] tracking-[-0.06em] text-white sm:text-6xl">
                  {fullName}
                </h1>
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-sky-100/78">
                  {department}
                </p>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/76">
                  {instructor.designation} at RPI Polytechnic. This public profile is powered by
                  the real instructor record from the backend and stays aligned with the faculty
                  directory experience.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="instructor-card-chip border-white/10 bg-white/10 text-white">
                    {instructor.designation}
                  </span>
                  <span className="instructor-card-chip border-white/10 bg-white/10 text-white">
                    ID {instructor.id}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <aside className="space-y-6">
            <section className="instructor-sidebar-card">
              <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
                Quick facts
              </h2>
              <div className="mt-6 space-y-4">
                <div className="instructor-side-row">
                  <span className="instructor-stat-icon">
                    <Building2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-(--text)">Department</p>
                    <p className="mt-1 text-xs leading-6 text-(--text-dim)">{department}</p>
                  </div>
                </div>
                <div className="instructor-side-row">
                  <span className="instructor-stat-icon">
                    <UserSquare2 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-(--text)">Designation</p>
                    <p className="mt-1 text-xs leading-6 text-(--text-dim)">
                      {instructor.designation}
                    </p>
                  </div>
                </div>
                <div className="instructor-side-row">
                  <span className="instructor-stat-icon">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-(--text)">Official email</p>
                    <p className="mt-1 text-xs leading-6 text-(--text-dim)">
                      {instructor.email}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="instructor-sidebar-card">
              <h2 className="font-display text-2xl font-bold tracking-[-0.04em] text-(--text)">
                Explore next
              </h2>
              <div className="mt-6 space-y-3">
                <Link href="/academic-calendar" className="instructor-link-tile">
                  Academic Calendar
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/notices" className="instructor-link-tile">
                  Notice Board
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <section className="instructor-content-card">
            <span className="instructor-page-kicker">Public profile</span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.05em] text-(--text)">
              Institutional listing
            </h2>
            <p className="mt-4 text-sm leading-8 text-(--text-dim)">
              This page now shows actual instructor information from the backend instead of
              academic-instructor placeholder data. It highlights the designation, department,
              faculty ID, and official email in a cleaner public presentation.
            </p>
          </section>

          <section className="instructor-content-card">
            <span className="instructor-page-kicker">Record timestamp</span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.05em] text-(--text)">
              Last updated
            </h2>
            <p className="mt-4 text-sm leading-8 text-(--text-dim)">
              {formatDateLabel(instructor.updatedAt ?? instructor.createdAt)}
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
