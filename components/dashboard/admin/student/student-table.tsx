"use client";

import { Eye, Loader2 } from "lucide-react";
import type { UserStatus } from "@/lib/api/types";
import type { StudentTableRow } from "@/lib/utils/student/student-utils";
import {
  resolveDepartmentName,
  resolveSemesterLabel,
  resolveStudentFullName,
  resolveUserStatus,
} from "@/lib/utils/student/student-utils";

type StudentTableProps = {
  loading: boolean;
  rows: StudentTableRow[];
  total: number;
  currentPage: number;
  totalPages: number;
  statusPendingKey: string | null;
  statusOverrides: Record<string, UserStatus>;
  onDetails: (row: StudentTableRow) => void | Promise<void>;
  onStatusChange: (
    row: StudentTableRow,
    nextStatus: UserStatus,
  ) => void | Promise<void>;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function StudentTable({
  loading,
  rows,
  total,
  currentPage,
  totalPages,
  statusPendingKey,
  statusOverrides,
  onDetails,
  onStatusChange,
  onPrevPage,
  onNextPage,
}: StudentTableProps) {
  return (
    <>
      <div className="mt-4">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-(--text-dim)">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Loading students...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--line) p-8 text-center text-sm text-(--text-dim)">
            No student found for current filters.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--line) text-xs uppercase tracking-[0.08em] text-(--text-dim)">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Department</th>
                    <th className="px-3 py-3">Admission Semester</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const status = resolveUserStatus(row, statusOverrides[row._id]);
                    const activePending = statusPendingKey === `${row._id}:active`;
                    const blockedPending = statusPendingKey === `${row._id}:blocked`;
                    return (
                      <tr
                        key={row._id}
                        className="border-b border-(--line) last:border-b-0"
                      >
                        <td className="px-3 py-3 font-medium">{row.id}</td>
                        <td className="px-3 py-3">{resolveStudentFullName(row)}</td>
                        <td className="px-3 py-3 text-(--text-dim)">{row.email}</td>
                        <td className="px-3 py-3 text-(--text-dim)">
                          {resolveDepartmentName(row.academicDepartment)}
                        </td>
                        <td className="px-3 py-3 text-(--text-dim)">
                          {resolveSemesterLabel(row.admissionSemester)}
                        </td>
                        <td className="px-3 py-3">
                          {status ? (
                            <span
                              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                status === "active"
                                  ? "border-emerald-600/35 bg-emerald-500/10 text-emerald-500"
                                  : "border-amber-600/35 bg-amber-500/10 text-amber-500"
                              }`}
                            >
                              {status}
                            </span>
                          ) : (
                            <span className="text-(--text-dim)">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void onDetails(row)}
                              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium transition hover:border-(--primary) hover:text-(--primary)"
                            >
                              <Eye className="h-3.5 w-3.5" aria-hidden />
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => void onStatusChange(row, "active")}
                              disabled={activePending}
                              className="focus-ring rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
                            >
                              {activePending ? "..." : "Activate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void onStatusChange(row, "blocked")}
                              disabled={blockedPending}
                              className="focus-ring rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium disabled:opacity-50"
                            >
                              {blockedPending ? "..." : "Block"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:hidden">
              {rows.map((row) => {
                const status = resolveUserStatus(row, statusOverrides[row._id]);
                const activePending = statusPendingKey === `${row._id}:active`;
                const blockedPending = statusPendingKey === `${row._id}:blocked`;
                return (
                  <article
                    key={row._id}
                    className="rounded-xl border border-(--line) bg-(--surface) p-3"
                  >
                    <h3 className="text-base font-semibold">{resolveStudentFullName(row)}</h3>
                    <p className="mt-1 text-xs text-(--text-dim)">ID: {row.id}</p>
                    <p className="text-xs text-(--text-dim)">Email: {row.email}</p>
                    <p className="text-xs text-(--text-dim)">
                      Department: {resolveDepartmentName(row.academicDepartment)}
                    </p>
                    <p className="text-xs text-(--text-dim)">
                      Admission: {resolveSemesterLabel(row.admissionSemester)}
                    </p>
                    <p className="text-xs text-(--text-dim)">Status: {status ?? "-"}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => void onDetails(row)}
                        className="focus-ring rounded-lg border border-(--line) px-2 py-2 text-xs font-medium"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => void onStatusChange(row, "active")}
                        disabled={activePending}
                        className="focus-ring rounded-lg border border-(--line) px-2 py-2 text-xs font-medium disabled:opacity-50"
                      >
                        {activePending ? "..." : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void onStatusChange(row, "blocked")}
                        disabled={blockedPending}
                        className="focus-ring rounded-lg border border-(--line) px-2 py-2 text-xs font-medium disabled:opacity-50"
                      >
                        {blockedPending ? "..." : "Block"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-(--line) pt-4 text-sm">
        <p className="text-(--text-dim)">
          Showing {rows.length} of {total} students
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
