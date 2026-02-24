"use client";

import { Eye, Loader2 } from "lucide-react";
import type { AdminTableRow } from "@/lib/utils/admin/admin-utils";
import {
  resolveAdminFullName,
  resolveAdminUserStatus,
} from "@/lib/utils/admin/admin-utils";

type AdminTableProps = {
  loading: boolean;
  rows: AdminTableRow[];
  total: number;
  currentPage: number;
  totalPages: number;
  statusTargetId: string | null;
  onDetails: (row: AdminTableRow) => void | Promise<void>;
  onStatusChange: (row: AdminTableRow) => void | Promise<void>;
  onPrevPage: () => void;
  onNextPage: () => void;
};

export function AdminTable({
  loading,
  rows,
  total,
  currentPage,
  totalPages,
  statusTargetId,
  onDetails,
  onStatusChange,
  onPrevPage,
  onNextPage,
}: AdminTableProps) {
  return (
    <>
      <div className="mt-4">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center text-sm text-(--text-dim)">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
            Loading admins...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-(--line) p-8 text-center text-sm text-(--text-dim)">
            No admin found for current filters.
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-(--line) text-xs uppercase tracking-[0.08em] text-(--text-dim)">
                    <th className="px-3 py-3">Admin ID</th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Designation</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const status = resolveAdminUserStatus(row);
                    const isUpdating = statusTargetId === row._id;
                    return (
                      <tr
                        key={row._id}
                        className="border-b border-(--line) last:border-b-0"
                      >
                        <td className="px-3 py-3 font-medium">{row.id}</td>
                        <td className="px-3 py-3">{resolveAdminFullName(row)}</td>
                        <td className="px-3 py-3 text-(--text-dim)">
                          {row.email}
                        </td>
                        <td className="px-3 py-3 text-(--text-dim)">
                          {row.designation}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                              status === "active"
                                ? "border-emerald-600/35 bg-emerald-500/10 text-emerald-500"
                                : "border-amber-600/35 bg-amber-500/10 text-amber-500"
                            }`}
                          >
                            {status}
                          </span>
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
                              onClick={() => void onStatusChange(row)}
                              disabled={isUpdating}
                              className="focus-ring inline-flex items-center gap-1 rounded-lg border border-(--line) px-2.5 py-1.5 text-xs font-medium transition hover:border-(--primary) hover:text-(--primary) disabled:cursor-not-allowed disabled:opacity-55"
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2
                                    className="h-3.5 w-3.5 animate-spin"
                                    aria-hidden
                                  />
                                  Updating
                                </>
                              ) : status === "active" ? (
                                "Block"
                              ) : (
                                "Activate"
                              )}
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
                const status = resolveAdminUserStatus(row);
                const isUpdating = statusTargetId === row._id;
                return (
                  <article
                    key={row._id}
                    className="rounded-xl border border-(--line) bg-(--surface) p-3"
                  >
                    <h3 className="text-base font-semibold">
                      {resolveAdminFullName(row)}
                    </h3>
                    <p className="mt-1 text-xs text-(--text-dim)">
                      Admin ID: {row.id}
                    </p>
                    <p className="text-xs text-(--text-dim)">Email: {row.email}</p>
                    <p className="text-xs text-(--text-dim)">
                      Designation: {row.designation}
                    </p>
                    <p className="mt-1 text-xs text-(--text-dim)">
                      Status: <span className="font-semibold capitalize">{status}</span>
                    </p>
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
                        onClick={() => void onStatusChange(row)}
                        disabled={isUpdating}
                        className="focus-ring inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-(--line) px-2.5 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-55"
                      >
                        {isUpdating
                          ? "Updating..."
                          : status === "active"
                            ? "Block"
                            : "Activate"}
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
          Showing {rows.length} of {total} admins
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevPage}
            disabled={currentPage <= 1 || loading}
            className="focus-ring rounded-lg border border-(--line) px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45"
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
            className="focus-ring rounded-lg border border-(--line) px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </footer>
    </>
  );
}
