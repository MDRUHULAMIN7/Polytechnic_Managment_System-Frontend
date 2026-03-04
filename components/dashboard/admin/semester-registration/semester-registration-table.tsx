"use client";

import Link from "next/link";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { SemesterRegistrationTableProps } from "@/lib/type/dashboard/admin/semester-registration/ui";

function renderSemester(value: SemesterRegistration["academicSemester"]) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return `${value.name} ${value.year}`;
}

function renderDate(value?: string) {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function SemesterRegistrationTable({
  items,
  loading,
  error,
  onEdit,
  onDelete,
  basePath = "/dashboard/admin/semester-registrations",
  showEdit = true,
  showDelete = true,
  actionsLabel = "Actions",
}: SemesterRegistrationTableProps) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Semester</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Shift</th>
              <th className="px-5 py-4 font-semibold">Start</th>
              <th className="px-5 py-4 font-semibold">End</th>
              <th className="px-5 py-4 font-semibold">Total Credit</th>
              <th className="px-5 py-4 font-semibold text-right">{actionsLabel}</th>
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
                      <div className="h-4 w-20 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-32 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-(--text-dim)">
                  {error ? "Failed to load registrations." : "No registrations found."}
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => (
                <tr key={item._id} className="border-b border-(--line) last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-medium">{renderSemester(item.academicSemester)}</p>
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.status}</td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.shift}</td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderDate(item.startDate)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderDate(item.endDate)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {item.totalCredit}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`${basePath}/${item._id}`}
                        scroll={false}
                        className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                      >
                        View
                      </Link>
                      {showEdit && onEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                        >
                          Edit
                        </button>
                      ) : null}
                      {showDelete && onDelete ? (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-red-500/50 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
