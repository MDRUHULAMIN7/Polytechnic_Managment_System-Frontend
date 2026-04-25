"use client";

import type { EnrolledSubject } from "@/lib/type/dashboard/admin/enrolled-subject";
import { resolveName } from "@/utils/dashboard/admin/utils";

function renderSubject(value: EnrolledSubject["subject"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }

  const code = value.code ? `${value.code}` : "";
  return code ? `${value.title} (${code})` : value.title ?? "--";
}

function renderCredits(value: EnrolledSubject["subject"]) {
  if (!value || typeof value === "string") {
    return "--";
  }
  return value.credits ?? "--";
}

function renderInstructor(value: EnrolledSubject["instructor"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  return resolveName(value.name);
}

function renderRegistration(value: EnrolledSubject["semesterRegistration"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  return `${value.status ?? "--"} / ${value.shift ?? "--"}`;
}

function renderSchedule(value: EnrolledSubject["offeredSubject"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  const days = value.days?.length ? value.days.join(", ") : "--";
  const time =
    value.startTime && value.endTime ? `(${value.startTime} - ${value.endTime})` : "";
  return [days, time].filter(Boolean).join(" ");
}

function renderStatus(item: EnrolledSubject) {
  if (item.isCompleted) {
    const grade = item.grade ?? "--";
    const points =
      typeof item.gradePoints === "number" ? `(${item.gradePoints})` : "";
    return `Completed ${grade} ${points}`.trim();
  }

  if (item.isEnrolled) {
    return "Enrolled";
  }

  return "--";
}

export function EnrolledSubjectTable({
  items,
  loading,
  error,
  onView,
}: {
  items: EnrolledSubject[];
  loading: boolean;
  error?: string | null;
  onView?: (item: EnrolledSubject) => void;
}) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Subject</th>
              <th className="px-5 py-4 font-semibold">Instructor</th>
              <th className="px-5 py-4 font-semibold">Registration</th>
              <th className="px-5 py-4 font-semibold">Schedule</th>
              <th className="px-5 py-4 font-semibold">Credits</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold text-right">Details</th>
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
                      <div className="h-4 w-32 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-20 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-(--text-dim)">
                  {error ? "Failed to load enrolled subjects." : "No enrolled subjects found."}
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
                    {renderRegistration(item.semesterRegistration)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderSchedule(item.offeredSubject)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderCredits(item.subject)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderStatus(item)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onView?.(item)}
                      className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                    >
                      View Marks
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
