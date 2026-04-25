import Link from "next/link";
import type { Metadata } from "next";
import { AdminClassAttendancePanel } from "@/components/dashboard/admin/class-session/admin-class-attendance-panel";
import { AdminClassSessionControls } from "@/components/dashboard/admin/class-session/admin-class-session-controls";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getAdminClassDetailsServer } from "@/lib/api/dashboard/class-session/server";
import { buildClassSessionBackHref } from "@/utils/dashboard/class-session-list";
import {
  formatClassDate,
  formatTimeRange,
  resolveClassInstructorName,
  resolveClassSubjectTitle,
  statusBadgeClass,
} from "@/utils/dashboard/class-session";

export const metadata: Metadata = {
  title: "Admin Class Details",
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminClassDetailsPage({
  params,
  searchParams,
}: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const details = await getAdminClassDetailsServer(resolvedParams.id);
  const item = details.classSession;
  const backHref = buildClassSessionBackHref(
    "/dashboard/admin/classes",
    resolvedSearchParams,
  );

  return (
    <section className="space-y-6">
      <Link
        href={backHref}
        className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
      >
        Back to Class Monitor
      </Link>

      <div className="rounded-2xl border border-(--line) bg-(--surface) p-5">
        <DashboardPageHeader
          title={resolveClassSubjectTitle(item.subject)}
          description={resolveClassInstructorName(item.instructor)}
          action={
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                item.status,
              )}`}
            >
              {item.status}
            </span>
          }
          className="sm:items-start"
        />

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Date
            </p>
            <p className="mt-2 font-medium">{formatClassDate(item.date)}</p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Time
            </p>
            <p className="mt-2 font-medium">
              {formatTimeRange(item.startTime, item.endTime)}
            </p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Attendance
            </p>
            <p className="mt-2 font-medium">
              {details.statistics.presentCount}/{details.statistics.totalStudents} present
            </p>
          </div>
        </div>

        <AdminClassSessionControls
          classSessionId={item._id}
          status={item.status}
          date={item.date}
          startTime={item.startTime}
          endTime={item.endTime}
        />

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          <div className="rounded-xl border border-(--line) px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Topic
            </p>
            <p className="mt-2 font-medium">{item.topic || "Not provided yet"}</p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Instructor Remarks
            </p>
            <p className="mt-2 text-sm text-(--text-dim)">
              {item.remarks || "No remarks shared yet."}
            </p>
          </div>
        </div>
      </div>

      <AdminClassAttendancePanel
        classSessionId={item._id}
        initialStatistics={details.statistics}
        initialAttendance={details.attendance}
      />
    </section>
  );
}
