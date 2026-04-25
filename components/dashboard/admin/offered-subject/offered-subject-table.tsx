"use client";

import Link from "next/link";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { OfferedSubjectTableProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { resolveName } from "@/utils/dashboard/admin/utils";

function renderSubject(value: OfferedSubject["subject"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  return value.title ?? "--";
}



function renderInstructor(value: OfferedSubject["instructor"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  return resolveName(value.name);
}

function renderSemester(value: OfferedSubject["academicSemester"]) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  return `${value.name ?? ""} ${value.year ?? ""}`.trim() || "--";
}

export function OfferedSubjectTable({
  items,
  loading,
  error,
  onEdit,
  onDelete,
  basePath = "/dashboard/admin/offered-subjects",
  showEdit = true,
  showDelete = true,
  actionsLabel = "Actions",
  viewLabel = "View",
}: OfferedSubjectTableProps) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Subject</th>
              <th className="px-5 py-4 font-semibold">Instructor</th>
              <th className="px-5 py-4 font-semibold">Semester</th>
              <th className="px-5 py-4 font-semibold">Capacity</th>
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
                      <div className="h-4 w-32 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-28 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-(--text-dim)">
                  {error ? "Failed to load offered subjects." : "No offered subjects found."}
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => (
                <tr key={item._id} className="border-b border-(--line) last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-medium">{renderSubject(item.subject)}</p>
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderInstructor(item.instructor)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderSemester(item.academicSemester)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.maxCapacity}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`${basePath}/${item._id}`}
                        scroll={false}
                        className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                      >
                        {viewLabel}
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
