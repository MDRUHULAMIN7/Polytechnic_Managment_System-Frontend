"use client";

import { Eye, Loader2, Pencil, Trash2 } from "lucide-react";
import type { SemesterRegistration } from "@/lib/api/types";
import {
  resolveSemesterLabel,
} from "@/lib/utils/semester-registration/semester-registration-utils";
import { formatDate } from "@/lib/utils/utils";

type SemesterRegistrationTableProps = {
  loading: boolean;
  rows: SemesterRegistration[];
  total: number;
  currentPage: number;
  totalPages: number;
  deletingId: string | null;
  onDetails: (row: SemesterRegistration) => void | Promise<void>;
  onUpdate: (row: SemesterRegistration) => void;
  onDelete: (row: SemesterRegistration) => void | Promise<void>;
  onPrevPage: () => void;
  onNextPage: () => void;
  viewOnly?: boolean;
};

function StatusBadge({ status }: { status: SemesterRegistration["status"] }) {
  if (status === "ONGOING") {
    return (
      <span className="inline-flex rounded-full border border-sky-600/35 bg-sky-500/10 px-2 py-0.5 text-xs font-semibold text-sky-500">
        {status}
      </span>
    );
  }

  if (status === "ENDED") {
    return (
      <span className="inline-flex rounded-full border border-zinc-600/35 bg-zinc-500/10 px-2 py-0.5 text-xs font-semibold text-zinc-500">
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-amber-600/35 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500">
      {status}
    </span>
  );
}

export function SemesterRegistrationTable({
  loading,
  rows,
  total,
  currentPage,
  totalPages,
  deletingId,
  onDetails,
  onUpdate,
  onDelete,
  onPrevPage,
  onNextPage,
  viewOnly = false,
}: SemesterRegistrationTableProps) {
  return (
    <>
      <div className="mt-4">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-(--text-dim)">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Loading semester registrations...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--line) p-8 text-center text-sm text-(--text-dim)">
            No semester registration found for current filters.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--line) text-xs uppercase tracking-[0.08em] text-(--text-dim)">
                    <th className="px-3 py-3">Semester</th>
                    <th className="px-3 py-3">Shift</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Timeline</th>
                    <th className="px-3 py-3">Total Credit</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const isDeleting = deletingId === row._id;
                    return (
                      <tr key={row._id} className="border-b border-(--line) last:border-b-0">
                        <td className="px-3 py-3 font-medium">
                          {resolveSemesterLabel(row.academicSemester)}
                        </td>
                        <td className="px-3 py-3 text-(--text-dim)">{row.shift}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={row.status} />
                        </td>
                        <td className="px-3 py-3 text-(--text-dim)">
                          {formatDate(row.startDate)} - {formatDate(row.endDate)}
                        </td>
                        <td className="px-3 py-3 text-(--text-dim)">
                          {row.totalCredit}
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
                              <>
                                <button
                                  type="button"
                                  onClick={() => onUpdate(row)}
                                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium"
                                >
                                  <Pencil className="h-3.5 w-3.5" aria-hidden />
                                  Update
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void onDelete(row)}
                                  disabled={isDeleting}
                                  className="focus-ring inline-flex items-center gap-1 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-500 disabled:opacity-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                              </>
                            ) : null}
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
                const isDeleting = deletingId === row._id;
                return (
                  <article key={row._id} className="rounded-xl border border-(--line) bg-(--surface) p-3">
                    <h3 className="text-base font-semibold">
                      {resolveSemesterLabel(row.academicSemester)}
                    </h3>
                    <p className="mt-1 text-xs text-(--text-dim)">Shift: {row.shift}</p>
                    <p className="text-xs text-(--text-dim)">Status: {row.status}</p>
                    <p className="text-xs text-(--text-dim)">
                      Timeline: {formatDate(row.startDate)} - {formatDate(row.endDate)}
                    </p>
                    <p className="text-xs text-(--text-dim)">
                      Total Credit: {row.totalCredit}
                    </p>
                    <div
                      className={`mt-3 grid gap-2 ${
                        viewOnly ? "grid-cols-1" : "grid-cols-3"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => void onDetails(row)}
                        className="focus-ring rounded-lg border border-(--line) px-2 py-2 text-xs font-medium"
                      >
                        Details
                      </button>
                      {!viewOnly ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdate(row)}
                            className="focus-ring rounded-lg border border-(--line) px-2 py-2 text-xs font-medium"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDelete(row)}
                            disabled={isDeleting}
                            className="focus-ring rounded-lg border border-rose-500/40 bg-rose-500/10 px-2 py-2 text-xs font-medium text-rose-500 disabled:opacity-50"
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </>
                      ) : null}
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
          Showing {rows.length} of {total} semester registrations
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
