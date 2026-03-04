"use client";

import Link from "next/link";
import type { SemesterEnrollment } from "@/lib/type/dashboard/admin/semester-enrollment";
import type { SemesterEnrollmentTableProps } from "@/lib/type/dashboard/admin/semester-enrollment/ui";
import { resolveName } from "@/utils/dashboard/admin/utils";



function renderValue(value: unknown, fallback = "--") {
  if (!value) {
    return fallback;
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object" && "name" in value && "year" in value) {
    const name = (value as { name?: string }).name ?? "";
    const year = (value as { year?: string }).year ?? "";
    return `${name} ${year}`.trim() || fallback;
  }
  if (typeof value === "object" && "name" in value) {
    return (value as { name?: string }).name ?? fallback;
  }
  if (typeof value === "object" && "session" in value) {
    return (value as { session?: string }).session ?? fallback;
  }
  return fallback;
}

function renderCurriculum(value: SemesterEnrollment["curriculum"]) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  const session = value.session ?? "--";
  const regulation =
    typeof value.regulation === "number" ? `Reg ${value.regulation}` : "";
  return [session, regulation].filter(Boolean).join(" ");
}

function renderStudent(value: SemesterEnrollment["student"]) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  const name = resolveName(value.name);
  return value.id ? `${value.id} - ${name}` : name;
}

export function SemesterEnrollmentTable({
  items,
  loading,
  error,
  basePath = "/dashboard/admin/semester-enrollments",
  showView = false,
  viewLabel = "View",
  actionsLabel = "Actions",
}: SemesterEnrollmentTableProps) {
  const columnCount = showView ? 8 : 7;

  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Student</th>
              <th className="px-5 py-4 font-semibold">Department</th>
              <th className="px-5 py-4 font-semibold">Semester</th>
              <th className="px-5 py-4 font-semibold">Curriculum</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Fees</th>
              <th className="px-5 py-4 font-semibold">Paid</th>
              {showView ? (
                <th className="px-5 py-4 font-semibold text-right">{actionsLabel}</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-(--line)">
                    <td className="px-5 py-4">
                      <div className="h-4 w-40 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-12 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    {showView ? (
                      <td className="px-5 py-4 text-right">
                        <div className="ml-auto h-9 w-20 animate-pulse rounded-lg bg-(--surface-muted)" />
                      </td>
                    ) : null}
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-5 py-8 text-center text-(--text-dim)">
                  {error ? "Failed to load semester enrollments." : "No enrollments found."}
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => (
                <tr key={item._id} className="border-b border-(--line) last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-medium">{renderStudent(item.student)}</p>
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderValue(item.academicDepartment)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderValue(item.academicSemester)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderCurriculum(item.curriculum)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.status}</td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.fees}</td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {item.isPaid ? "Yes" : "No"}
                  </td>
                  {showView ? (
                    <td className="px-5 py-4 text-right">
                      {item._id ? (
                        <Link
                          href={`${basePath}/${item._id}`}
                          scroll={false}
                          className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                        >
                          {viewLabel}
                        </Link>
                      ) : (
                        <span className="inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) opacity-60">
                          {viewLabel}
                        </span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
