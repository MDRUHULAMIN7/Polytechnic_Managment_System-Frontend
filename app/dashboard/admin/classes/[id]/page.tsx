import Link from "next/link";
import type { Metadata } from "next";
import { getAdminClassDetailsServer } from "@/lib/api/dashboard/class-session/server";
import { resolveName } from "@/utils/dashboard/admin/utils";
import {
  formatClassDate,
  formatTimeRange,
  resolveClassInstructorName,
  resolveClassSection,
  resolveClassSubjectTitle,
  statusBadgeClass,
} from "@/utils/dashboard/class-session";

export const metadata: Metadata = {
  title: "Admin Class Details",
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function AdminClassDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const details = await getAdminClassDetailsServer(resolvedParams.id);
  const item = details.classSession;

  return (
    <section className="space-y-6">
      <Link
        href="/dashboard/admin/classes"
        className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
      >
        Back to Class Monitor
      </Link>

      <div className="rounded-2xl border border-(--line) bg-(--surface) p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
              Admin Module
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              {resolveClassSubjectTitle(item.subject)}
            </h1>
            <p className="mt-2 text-sm text-(--text-dim)">
              {resolveClassInstructorName(item.instructor)}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
              item.status,
            )}`}
          >
            {item.status}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
              Section
            </p>
            <p className="mt-2 font-medium">{resolveClassSection(item.offeredSubject)}</p>
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

        <div className="mt-5 overflow-x-auto rounded-2xl border border-(--line)">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-(--line) text-left text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Marked At</th>
              </tr>
            </thead>
            <tbody>
              {details.attendance.map((row) => (
                <tr key={row._id} className="border-b border-(--line)/70">
                  <td className="px-4 py-3">
                    {typeof row.student === "string" ? (
                      row.student
                    ) : (
                      <>
                        <p className="font-medium">{resolveName(row.student?.name)}</p>
                        <p className="text-xs text-(--text-dim)">{row.student?.id ?? "--"}</p>
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-(--text-dim)">
                    {typeof row.student === "string"
                      ? "--"
                      : `${row.student?.email ?? "--"} · ${row.student?.contactNo ?? "--"}`}
                  </td>
                  <td className="px-4 py-3">{row.status}</td>
                  <td className="px-4 py-3 text-(--text-dim)">
                    {row.markedAt ? formatClassDate(row.markedAt) : "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
