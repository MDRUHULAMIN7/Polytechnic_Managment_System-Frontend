import Link from "next/link";
import type { DashboardSummary } from "@/lib/type/dashboard/class-session";
import { formatClassDate, formatTimeRange, resolveClassInstructorName, resolveClassSubjectTitle, statusBadgeClass } from "@/utils/dashboard/class-session";

export function AdminDashboard({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Admin Dashboard</h1>
      <p className="text-sm text-(--text-dim)">
        Monitor today&apos;s class operations and attendance coverage from one place.
      </p>

      <div className="grid gap-4 md:grid-cols-5">
        {[
          ["Today", summary.totalToday],
          ["Scheduled", summary.scheduled],
          ["Ongoing", summary.ongoing],
          ["Completed", summary.completed],
          ["Cancelled", summary.cancelled ?? 0],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-(--line) bg-(--surface) p-5"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              {label}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-(--line) bg-(--surface) p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Today&apos;s Classes</h2>
            <p className="mt-1 text-sm text-(--text-dim)">
              Use the class monitor to inspect full attendance details.
            </p>
          </div>
          <Link
            href="/dashboard/admin/classes"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Open Class Monitor
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {summary.sessions.length === 0 ? (
            <p className="text-sm text-(--text-dim)">No classes scheduled for today.</p>
          ) : (
            summary.sessions.slice(0, 6).map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-2 rounded-xl border border-(--line) px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{resolveClassSubjectTitle(item.subject)}</p>
                    <p className="text-sm text-(--text-dim)">
                      {resolveClassInstructorName(item.instructor)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-(--text-dim)">
                  {formatClassDate(item.date)} · {formatTimeRange(item.startTime, item.endTime)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
