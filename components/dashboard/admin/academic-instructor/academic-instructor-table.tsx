"use client";

import { Eye, Loader2, Pencil } from "lucide-react";
import type { AcademicInstructor } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/utils";

type PaginationResult<T> = {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
};

type AcademicInstructorTableProps = {
  loading: boolean;
  pagination: PaginationResult<AcademicInstructor>;
  onDetails: (row: AcademicInstructor) => void | Promise<void>;
  onUpdate: (row: AcademicInstructor) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function AcademicInstructorTable({
  loading,
  pagination,
  onDetails,
  onUpdate,
  onPrevPage,
  onNextPage,
}: AcademicInstructorTableProps) {
  return (
    <>
      <div className="mt-4">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-(--text-dim)">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Loading academic instructors...
          </div>
        ) : pagination.total === 0 ? (
          <div className="rounded-xl border border-dashed border-(--line) p-8 text-center text-sm text-(--text-dim)">
            No academic instructor found for current filters.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--line) text-xs uppercase tracking-[0.08em] text-(--text-dim)">
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Created</th>
                    <th className="px-3 py-3">Updated</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.items.map((row) => (
                    <tr key={row._id} className="border-b border-(--line) last:border-b-0">
                      <td className="px-3 py-3 font-medium">{row.name}</td>
                      <td className="px-3 py-3 text-(--text-dim)">{formatDate(row.createdAt)}</td>
                      <td className="px-3 py-3 text-(--text-dim)">{formatDate(row.updatedAt)}</td>
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
                            onClick={() => onUpdate(row)}
                            className="focus-ring inline-flex items-center gap-1 rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium transition hover:border-(--primary) hover:text-(--primary)"
                          >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Update
                          </button>
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
                  <h3 className="text-base font-semibold">{row.name}</h3>
                  <p className="mt-1 text-xs text-(--text-dim)">Created: {formatDate(row.createdAt)}</p>
                  <p className="text-xs text-(--text-dim)">Updated: {formatDate(row.updatedAt)}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void onDetails(row)}
                      className="focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-(--line) px-2.5 py-2 text-xs font-medium"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate(row)}
                      className="focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-(--line) px-2.5 py-2 text-xs font-medium"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden />
                      Update
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
          Showing {pagination.items.length} of {pagination.total} instructors
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={pagination.page <= 1}
            className="focus-ring rounded-lg border border-(--line) px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45"
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
            className="focus-ring rounded-lg border border-(--line) px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </footer>
    </>
  );
}
