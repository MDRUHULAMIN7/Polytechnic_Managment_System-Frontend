"use client";

import { Eye, Loader2, Pencil } from "lucide-react";
import type { AcademicSemester } from "@/lib/api/types";

type PaginationResult<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

type AcademicSemesterTableProps = {
  loading: boolean;
  pagination: PaginationResult<AcademicSemester>;
  onDetails: (row: AcademicSemester) => void | Promise<void>;
  onUpdate: (row: AcademicSemester) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  viewOnly?: boolean;
};

export function AcademicSemesterTable({
  loading,
  pagination,
  onDetails,
  onUpdate,
  onPrevPage,
  onNextPage,
  viewOnly = false,
}: AcademicSemesterTableProps) {
  return (
    <>
      <div className="mt-4">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-(--text-dim)">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Loading academic semesters...
          </div>
        ) : pagination.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--line) p-8 text-center text-sm text-(--text-dim)">
            No academic semester found.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--line) text-xs uppercase tracking-[0.08em] text-(--text-dim)">
                    <th className="px-3 py-3">Semester</th>
                    <th className="px-3 py-3">Year</th>
                    <th className="px-3 py-3">Duration</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.items.map((row) => (
                    <tr key={row._id} className="border-b border-(--line) last:border-b-0">
                      <td className="px-3 py-3 font-medium">
                        {row.name} ({row.code})
                      </td>
                      <td className="px-3 py-3 text-(--text-dim)">{row.year}</td>
                      <td className="px-3 py-3 text-(--text-dim)">
                        {row.startMonth} - {row.endMonth}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => void onDetails(row)}
                            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                            Details
                          </button>
                          {!viewOnly ? (
                            <button
                              type="button"
                              onClick={() => onUpdate(row)}
                              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden />
                              Update
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 md:hidden">
              {pagination.items.map((row) => (
                <article key={row._id} className="rounded-xl border border-(--line) bg-(--surface) p-3">
                  <h3 className="text-base font-semibold">
                    {row.name} ({row.code})
                  </h3>
                  <p className="text-xs text-(--text-dim)">Year: {row.year}</p>
                  <p className="text-xs text-(--text-dim)">
                    Duration: {row.startMonth} - {row.endMonth}
                  </p>
                  <div className={`mt-3 ${viewOnly ? "" : "flex gap-2"}`}>
                    <button
                      type="button"
                      onClick={() => void onDetails(row)}
                      className={`focus-ring inline-flex items-center justify-center gap-1 rounded-lg border border-(--line) px-2.5 py-2 text-xs font-medium ${
                        viewOnly ? "w-full" : "flex-1"
                      }`}
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                      Details
                    </button>
                    {!viewOnly ? (
                      <button
                        type="button"
                        onClick={() => onUpdate(row)}
                        className="focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-(--line) px-2.5 py-2 text-xs font-medium"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Update
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="mt-4 flex items-center justify-between border-t border-(--line) pt-4 text-sm">
        <p className="text-(--text-dim)">
          Showing {pagination.items.length} of {pagination.total} semesters
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={pagination.page <= 1}
            className="focus-ring rounded-lg border border-(--line) px-3 py-1.5 text-xs disabled:opacity-45"
          >
            Prev
          </button>
          <span className="rounded-lg border border-(--line) px-3 py-1.5 text-xs">
            Page {pagination.page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={onNextPage}
            disabled={pagination.page >= pagination.totalPages}
            className="focus-ring rounded-lg border border-(--line) px-3 py-1.5 text-xs disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </footer>
    </>
  );
}
