import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getAdminClassDetailsServer } from "@/lib/api/dashboard/class-session/server";
import { buildClassSessionBackHref } from "@/utils/dashboard/class-session-list";
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
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function AdminClassDetailsPage({ params, searchParams }: PageProps) {
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

        <div className="mt-5 space-y-3 md:hidden">
          {details.attendance.map((row) => (
            <article
              key={row._id}
              className="rounded-xl border border-(--line) bg-(--surface-muted) p-4"
            >
              <div>
                {typeof row.student === "string" ? (
                  <p className="font-medium">{row.student}</p>
                ) : (
                  <>
                    <p className="font-medium">{resolveName(row.student?.name)}</p>
                    <p className="mt-1 text-xs text-(--text-dim)">{row.student?.id ?? "--"}</p>
                  </>
                )}
              </div>
              <div className="mt-3 space-y-1 text-sm text-(--text-dim)">
                <p>{typeof row.student === "string" ? "--" : row.student?.email ?? "--"}</p>
                <p>{typeof row.student === "string" ? "--" : row.student?.contactNo ?? "--"}</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                    Status
                  </p>
                  <p className="mt-1 text-sm">{row.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                    Marked At
                  </p>
                  <p className="mt-1 text-sm">
                    {row.markedAt ? formatClassDate(row.markedAt) : "--"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-(--line) md:block">
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
