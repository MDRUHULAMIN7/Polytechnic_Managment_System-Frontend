"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

type PublicAcademicInstructorsPageProps = {
  instructors: Instructor[];
  instructorError: string | null;
};

type Filters = {
  search: string;
  department: string;
  designation: string;
};

type DirectoryEntry = {
  _id: string;
  id: string;
  fullName: string;
  designation: string;
  department: string;
  email: string;
  profileImg?: string;
  summary: string;
  chips: string[];
  monogram: string;
};

const PAGE_SIZE = 8;

function resolveDepartmentName(department?: AcademicDepartment | string) {
  if (!department) {
    return "Department not published";
  }

  if (typeof department === "string") {
    return department;
  }

  return department.name ?? "Department not published";
}

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

function buildSummary(instructor: Instructor, department: string) {
  return `${instructor.designation} in ${department}. Public profile published through the RPI Polytechnic faculty directory for students, guardians, and visitors.`;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function buildEntries(instructors: Instructor[]): DirectoryEntry[] {
  return [...instructors]
    .map((instructor) => {
      const fullName = fullNameFromInstructor(instructor);
      const department = resolveDepartmentName(instructor.academicDepartment);

      return {
        _id: instructor._id,
        id: instructor.id,
        fullName,
        designation: instructor.designation,
        department,
        email: instructor.email,
        profileImg: instructor.profileImg,
        summary: buildSummary(instructor, department),
        chips: [department, `ID ${instructor.id}`],
        monogram: monogramFromName(fullName),
      };
    })
    .sort((left, right) => left.fullName.localeCompare(right.fullName));
}

export function PublicAcademicInstructorsPage({
  instructors,
  instructorError,
}: PublicAcademicInstructorsPageProps) {
  const entries = useMemo(() => buildEntries(instructors), [instructors]);
  const departments = useMemo(
    () =>
      Array.from(new Set(entries.map((entry) => entry.department))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [entries]
  );
  const designations = useMemo(
    () =>
      Array.from(new Set(entries.map((entry) => entry.designation))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [entries]
  );
  const [draftFilters, setDraftFilters] = useState<Filters>({
    search: "",
    department: "all",
    designation: "all",
  });
  const [activeFilters, setActiveFilters] = useState<Filters>({
    search: "",
    department: "all",
    designation: "all",
  });
  const [page, setPage] = useState(1);

  const filteredEntries = useMemo(() => {
    const normalizedSearch = activeFilters.search.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesSearch =
        !normalizedSearch ||
        entry.fullName.toLowerCase().includes(normalizedSearch) ||
        entry.department.toLowerCase().includes(normalizedSearch) ||
        entry.designation.toLowerCase().includes(normalizedSearch) ||
        entry.id.toLowerCase().includes(normalizedSearch);

      const matchesDepartment =
        activeFilters.department === "all" ||
        entry.department === activeFilters.department;

      const matchesDesignation =
        activeFilters.designation === "all" ||
        entry.designation === activeFilters.designation;

      return matchesSearch && matchesDepartment && matchesDesignation;
    });
  }, [activeFilters, entries]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleEntries = filteredEntries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const stats = {
    total: entries.length,
    departments: departments.length,
    designations: designations.length,
  };

  return (
    <section className="instructor-directory-page px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="instructor-page-kicker">Academic Faculty Directory</span>
            <h1 className="mt-4 font-display text-5xl font-extrabold leading-tight tracking-[-0.06em] text-(--text) md:text-7xl">
              The Minds Behind
              <br />
              the <span className="font-normal italic">Innovation.</span>
            </h1>
          </div>

          <div className="flex flex-col items-start gap-2 text-left md:items-end md:text-right">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-(--text-dim)">
              Active Personnel
            </span>
            <div className="font-display text-4xl font-bold tracking-[-0.05em] text-(--accent)">
              {formatCount(stats.total)}+
            </div>
            <p className="max-w-xs text-sm leading-7 text-(--text-dim)">
              Dedicated educators across {formatCount(stats.departments)} academic departments.
            </p>
          </div>
        </header>

        <section className="mb-12 sticky top-24 z-40">
          <div className="glass-panel rounded-[2rem] border border-white/20 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-dim)" />
                <input
                  type="text"
                  value={draftFilters.search}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Search by name, designation, or faculty ID..."
                  className="h-14 w-full rounded-[1.4rem] border border-[color:color-mix(in_srgb,var(--line)_75%,transparent)] bg-white/55 pl-12 pr-4 text-sm text-(--text) outline-none transition focus:border-(--accent) focus:bg-white dark:bg-slate-950/35 dark:focus:bg-slate-950/55"
                />
              </div>

              <div className="flex flex-col gap-3 md:flex-row xl:w-auto">
                <select
                  value={draftFilters.department}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      department: event.target.value,
                    }))
                  }
                  className="h-14 min-w-[15rem] rounded-full border-none bg-[color:color-mix(in_srgb,var(--surface-muted)_72%,white)] px-6 text-sm font-medium text-(--text) outline-none"
                >
                  <option value="all">All Departments</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>

                <select
                  value={draftFilters.designation}
                  onChange={(event) =>
                    setDraftFilters((current) => ({
                      ...current,
                      designation: event.target.value,
                    }))
                  }
                  className="h-14 min-w-[14rem] rounded-full border-none bg-[color:color-mix(in_srgb,var(--surface-muted)_72%,white)] px-6 text-sm font-medium text-(--text) outline-none"
                >
                  <option value="all">Academic Rank</option>
                  {designations.map((designation) => (
                    <option key={designation} value={designation}>
                      {designation}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setActiveFilters(draftFilters);
                    setPage(1);
                  }}
                  className="focus-ring inline-flex h-14 items-center justify-center gap-2 rounded-full bg-(--text) px-6 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:brightness-110 dark:bg-(--accent) dark:text-(--accent-ink)"
                >
                  <Filter className="h-4 w-4" />
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </section>

        {instructorError ? (
          <div className="instructor-empty-state mb-12">
            <p className="text-base font-semibold text-(--text)">Instructor data could not be loaded.</p>
            <p className="mt-3 text-sm leading-7 text-(--text-dim)">{instructorError}</p>
          </div>
        ) : null}

        {!instructorError && !visibleEntries.length ? (
          <div className="instructor-empty-state mb-12">
            <p className="text-base font-semibold text-(--text)">No matching instructors found.</p>
            <p className="mt-3 text-sm leading-7 text-(--text-dim)">
              Try another search term or change the selected department and rank filters.
            </p>
          </div>
        ) : null}

        {!instructorError && visibleEntries.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleEntries.map((entry) => (
              <article key={entry._id} className="instructor-directory-card">
                <div className="instructor-card-photo-shell">
                  {entry.profileImg ? (
                    <img
                      src={entry.profileImg}
                      alt={entry.fullName}
                      className="instructor-card-photo"
                    />
                  ) : (
                    <div className="instructor-card-photo-fallback">
                      <span>{entry.monogram}</span>
                    </div>
                  )}
                  <div className="instructor-card-photo-overlay" />
                  <div className="instructor-card-badge">{entry.designation}</div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-2xl font-bold text-(--text)">
                    {entry.fullName}
                  </h2>
                  <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-(--accent)">
                    {entry.department}
                  </p>
                  <p className="mt-4 text-sm font-medium leading-7 text-(--text-dim)">
                    {entry.summary}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {entry.chips.map((chip) => (
                      <span key={chip} className="instructor-card-chip">
                        {chip}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-[color:color-mix(in_srgb,var(--line)_70%,transparent)] pt-4">
                    <span className="text-xs font-semibold text-(--text-dim)">
                      {entry.email}
                    </span>
                    <Link
                      href={`/academic-instructors/${entry._id}`}
                      className="inline-flex items-center gap-1 text-sm font-bold text-(--accent) transition hover:gap-2"
                    >
                      Profile
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            <article className="instructor-feature-card md:col-span-2 xl:col-span-2">
              <div className="flex-1 p-10">
                <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-sky-200/80">
                  Faculty Opportunities
                </span>
                <h2 className="mt-4 font-display text-3xl font-bold leading-snug text-white">
                  Inspire the Next Generation of Engineers.
                </h2>
                <p className="mt-4 max-w-sm text-sm leading-7 text-white/74">
                  Faculty profiles, notices, and academic planning work best when instructor
                  records stay current across the institution.
                </p>
                <div className="mt-8">
                  <Link
                    href="/notices"
                    className="focus-ring inline-flex min-h-12 items-center rounded-full bg-sky-300 px-8 text-xs font-bold uppercase tracking-[0.18em] text-slate-950 transition hover:brightness-105"
                  >
                    View Open Updates
                  </Link>
                </div>
              </div>
              <div className="instructor-feature-visual">
                <div className="instructor-feature-grid" />
                <div className="instructor-feature-panel">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-sky-100/70">
                    Directory Snapshot
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-white/12 bg-white/10 p-4 backdrop-blur-xl">
                      <p className="font-display text-3xl font-bold tracking-[-0.05em] text-white">
                        {formatCount(stats.total)}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/64">
                        Instructors
                      </p>
                    </div>
                    <div className="rounded-[1.4rem] border border-white/12 bg-white/10 p-4 backdrop-blur-xl">
                      <p className="font-display text-3xl font-bold tracking-[-0.05em] text-white">
                        {formatCount(stats.designations)}
                      </p>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/64">
                        Designations
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-7 text-white/72">
                    Real instructor records now power this public directory directly from the backend.
                  </p>
                </div>
              </div>
            </article>
          </div>
        ) : null}

        {!instructorError && filteredEntries.length > 0 ? (
          <div className="mt-20 flex flex-col items-center">
            <p className="text-sm text-(--text-dim)">
              Showing {Math.min(currentPage * PAGE_SIZE, filteredEntries.length)} of{" "}
              {filteredEntries.length} results
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="instructor-pagination-button"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 1))
                .map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`instructor-pagination-button ${
                      pageNumber === currentPage
                        ? "instructor-pagination-button-active"
                        : ""
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                className="instructor-pagination-button"
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
