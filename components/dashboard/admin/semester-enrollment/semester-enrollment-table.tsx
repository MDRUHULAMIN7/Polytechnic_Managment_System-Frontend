"use client";

import { Eye, Loader2 } from "lucide-react";
import type { SemesterEnrollment } from "@/lib/api/types";
import {
  resolveAcademicSemesterLabel,
  resolveCurriculumLabel,
  resolveDepartmentLabel,
  resolveEnrollmentStatusClass,
  resolvePaidLabel,
  resolveSemesterRegistrationDateRange,
  resolveSemesterRegistrationMeta,
  resolveStudentLabel,
} from "@/lib/utils/semester-enrollment/semester-enrollment-utils";

type SemesterEnrollmentTableProps = {
  loading: boolean;
  rows: SemesterEnrollment[];
  total: number;
  currentPage: number;
  totalPages: number;
  onDetails: (row: SemesterEnrollment) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function SemesterEnrollmentTable({
  loading,
  rows,
  total,
  currentPage,
  totalPages,
  onDetails,
  onPrevPage,
  onNextPage,
}: SemesterEnrollmentTableProps) {
  return (
    <>
      <div className="mt-4">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-(--text-dim)">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Loading semester enrollments...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--line) p-8 text-center text-sm text-(--text-dim)">
            No semester enrollment found for current filters.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--line) text-xs uppercase tracking-[0.08em] text-(--text-dim)">
                    <th className="px-3 py-3">Student</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Semester</th>
                    <th className="px-3 py-3">Registration</th>
                    <th className="px-3 py-3">Curriculum</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id} className="border-b border-(--line) last:border-b-0">
                      <td className="px-3 py-3 font-medium">{resolveStudentLabel(row.student)}</td>
                      <td className="px-3 py-3 text-(--text-dim)">
                        {resolveDepartmentLabel(row.academicDepartment)}
                      </td>
                      <td className="px-3 py-3 text-(--text-dim)">
                        {resolveAcademicSemesterLabel(row.academicSemester)}
                      </td>
                      <td className="px-3 py-3 text-(--text-dim)">
                        {resolveSemesterRegistrationDateRange(row.semesterRegistration)}
                      </td>
                      <td className="px-3 py-3 text-(--text-dim)">
                        {resolveCurriculumLabel(row.curriculum)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${resolveEnrollmentStatusClass(row.status)}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-(--text-dim)">
                        {resolvePaidLabel(row.isPaid)} ({row.fees ?? 0})
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => onDetails(row)}
                            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:hidden">
              {rows.map((row) => (
                <article key={row._id} className="rounded-xl border border-(--line) bg-(--surface) p-3">
                  <h3 className="text-base font-semibold">{resolveStudentLabel(row.student)}</h3>
                  <p className="mt-1 text-xs text-(--text-dim)">
                    Department: {resolveDepartmentLabel(row.academicDepartment)}
                  </p>
                  <p className="text-xs text-(--text-dim)">
                    Semester: {resolveAcademicSemesterLabel(row.academicSemester)}
                  </p>
                  <p className="text-xs text-(--text-dim)">
                    Registration:{" "}
                    {resolveSemesterRegistrationDateRange(row.semesterRegistration)}
                  </p>
                  <p className="text-xs text-(--text-dim)">
                    {resolveSemesterRegistrationMeta(row.semesterRegistration)}
                  </p>
                  <p className="text-xs text-(--text-dim)">
                    Curriculum: {resolveCurriculumLabel(row.curriculum)}
                  </p>
                  <p className="text-xs text-(--text-dim)">
                    Status: {row.status} | {resolvePaidLabel(row.isPaid)} ({row.fees ?? 0})
                  </p>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => onDetails(row)}
                      className="focus-ring w-full rounded-lg border border-(--line) px-2 py-2 text-xs font-medium"
                    >
                      Details
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-(--line) pt-4 text-sm">
        <p className="text-(--text-dim)">
          Showing {rows.length} of {total} semester enrollments
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1 || loading}
            className="focus-ring rounded-lg border border-(--line) px-3 py-1.5 text-xs font-medium disabled:opacity-45"
          >
            Prev
          </button>
          <span className="rounded-lg border border-(--line) px-3 py-1.5 text-xs">
            Page {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={currentPage >= totalPages || loading}
            className="focus-ring rounded-lg border border-(--line) px-3 py-1.5 text-xs font-medium disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </footer>
    </>
  );
}

