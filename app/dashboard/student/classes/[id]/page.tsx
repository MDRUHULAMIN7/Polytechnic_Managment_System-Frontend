import Link from "next/link";
import type { Metadata } from "next";
import { getStudentClassDetailsServer } from "@/lib/api/dashboard/class-session/server";
import { buildClassSessionBackHref } from "@/utils/dashboard/class-session-list";
import {
  formatClassDate,
  formatTimeRange,
  resolveClassInstructorName,
  resolveClassSection,
  resolveClassSubjectTitle,
  statusBadgeClass,
} from "@/utils/dashboard/class-session";

export const metadata: Metadata = {
  title: "Student Class Details",
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export default async function StudentClassDetailsPage({ params, searchParams }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const details = await getStudentClassDetailsServer(resolvedParams.id);
  const item = details.classSession;
  const backHref = buildClassSessionBackHref(
    "/dashboard/student/classes",
    resolvedSearchParams,
  );

  return (
    <section className="space-y-6">
      <Link
        href={backHref}
        className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
      >
        Back to My Classes
      </Link>

      <div className="rounded-2xl border border-(--line) bg-(--surface) p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
              Student Module
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
              Day
            </p>
            <p className="mt-2 font-medium">{item.day}</p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Section
            </p>
            <p className="mt-2 font-medium">{resolveClassSection(item.offeredSubject)}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-(--line) px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Class Topic
          </p>
          <p className="mt-2 font-medium">{item.topic || "Not provided yet"}</p>
          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Instructor Remarks
          </p>
          <p className="mt-2 text-sm text-(--text-dim)">
            {item.remarks || "No remarks shared yet."}
          </p>
        </div>

        <div className="mt-5 rounded-xl border border-(--line) px-4 py-4">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            My Attendance
          </p>
          <p className="mt-2 text-lg font-semibold">
            {details.myAttendance?.status ?? "Not marked yet"}
          </p>
          <p className="mt-1 text-sm text-(--text-dim)">
            {details.myAttendance?.markedAt
              ? `Marked on ${formatClassDate(details.myAttendance.markedAt)}`
              : "Attendance has not been marked by the instructor yet."}
          </p>
        </div>
      </div>
    </section>
  );
}
