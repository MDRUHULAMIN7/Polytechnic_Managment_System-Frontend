"use client";

import Link from "next/link";
import { BookOpen, User, Calendar, Users, Edit2, Trash2, Info } from "lucide-react";
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
  viewLabel = "Details",
}: OfferedSubjectTableProps) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface) shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-(--line) bg-(--surface-muted)/50">
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-(--text-dim)">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5" />
                  Subject
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-(--text-dim)">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Instructor
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-(--text-dim)">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Semester
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-(--text-dim)">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" />
                  Capacity
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-(--text-dim) text-right">
                {actionsLabel}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--line)">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td className="px-6 py-5">
                      <div className="h-4 w-40 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-32 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-24 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-6 py-5">
                      <div className="h-4 w-16 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="ml-auto h-9 w-28 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-(--text-dim)">
                  <div className="flex flex-col items-center gap-2">
                    <Info className="h-8 w-8 opacity-20" />
                    <p>{error ? "Failed to load offered subjects." : "No offered subjects found."}</p>
                  </div>
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => (
                <tr key={item._id} className="group transition-colors hover:bg-(--surface-muted)/30">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-(--text) group-hover:text-(--accent) transition-colors">
                      {renderSubject(item.subject)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-(--text-dim)">
                    {renderInstructor(item.instructor)}
                  </td>
                  <td className="px-6 py-4 text-(--text-dim)">
                    {renderSemester(item.academicSemester)}
                  </td>
                  <td className="px-6 py-4 text-(--text-dim)">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-(--text)">
                        {item.totalCapacity || item.maxCapacity}
                      </span>
                      <span className="text-[10px] opacity-40">/</span>
                      <span className="text-xs font-medium">{item.maxCapacity}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <Link
                        href={`${basePath}/${item._id}`}
                        scroll={false}
                        className="focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-(--line) bg-(--surface) px-3 text-xs font-semibold text-(--text-dim) transition hover:border-(--accent) hover:text-(--accent)"
                      >
                        <Info className="h-3.5 w-3.5" />
                        {viewLabel}
                      </Link>
                      {showEdit && onEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-(--line) bg-(--surface) px-3 text-xs font-semibold text-(--text-dim) transition hover:border-(--accent) hover:text-(--accent)"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                      ) : null}
                      {showDelete && onDelete ? (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="focus-ring inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
