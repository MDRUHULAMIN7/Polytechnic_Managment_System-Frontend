import Link from "next/link";
import type { Metadata } from "next";
import { ClassSessionPagination } from "@/components/dashboard/class-session/class-session-pagination";
import { ClassSessionFilters } from "@/components/dashboard/class-session/class-session-filters";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import {
  getClassSessionFilterOptionsServer,
  getInstructorClassSessionsServer,
} from "@/lib/api/dashboard/class-session/server";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import {
  buildClassSessionReturnQuery,
  createEmptyClassSessionListPayload,
  readClassSessionListState,
} from "@/utils/dashboard/class-session-list";
import {
  formatClassDate,
  formatTimeRange,
  resolveClassSection,
  statusBadgeClass,
} from "@/utils/dashboard/class-session";

export const metadata: Metadata = {
  title: "Instructor Classes",
};

export default async function InstructorClassesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const {
    semesterRegistration,
    subject,
    status,
    startDate,
    endDate,
    page,
    limit,
  } = readClassSessionListState(resolvedSearchParams);
  const detailQuery = buildClassSessionReturnQuery({
    semesterRegistration,
    subject,
    status,
    startDate,
    endDate,
    page,
    limit,
  });

  const [filterOptions, payload] = await Promise.all([
    getClassSessionFilterOptionsServer({
      semesterRegistration: semesterRegistration || undefined,
    }),
    semesterRegistration
      ? getInstructorClassSessionsServer({
          semesterRegistration,
          status: status || undefined,
          subject: subject || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page,
          limit,
        })
      : Promise.resolve(createEmptyClassSessionListPayload(limit)),
  ]);

  const selectedSemester = filterOptions.semesters.find(
    (item) => item.value === semesterRegistration,
  );

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="My Classes"
        description="Work semester by semester so your class queue stays scoped to one term."
      />

      <ClassSessionFilters
        semesterRegistration={semesterRegistration}
        subject={subject}
        status={status}
        startDate={startDate}
        endDate={endDate}
        limit={limit}
        semesterOptions={filterOptions.semesters}
        subjectOptions={filterOptions.subjects}
        statusOptions={[
          { value: "SCHEDULED", label: "Scheduled" },
          { value: "ONGOING", label: "Ongoing" },
          { value: "COMPLETED", label: "Completed" },
        ]}
      />

      {!semesterRegistration ? (
        <div className="rounded-2xl border border-dashed border-(--line) bg-(--surface) px-5 py-10 text-center">
          <p className="text-sm font-medium">Select a semester registration to load your classes.</p>
          <p className="mt-2 text-sm text-(--text-dim)">
            Subject, date, and status filters stay scoped under the selected term.
          </p>
        </div>
      ) : null}

      {semesterRegistration && selectedSemester ? (
        <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-3 text-sm text-(--text-dim)">
          Showing classes for <span className="font-semibold text-(--text)">{selectedSemester.label}</span>
        </div>
      ) : null}

      {semesterRegistration ? (
        <>
          <div className="space-y-3 md:hidden">
            {payload.result.map((item) => (
              <article
                key={item._id}
                className="rounded-2xl border border-(--line) bg-(--surface) p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {typeof item.subject === "string"
                        ? item.subject
                        : `${item.subject?.title ?? "--"}${item.subject?.code ? ` (${item.subject.code})` : ""}`}
                    </p>
                    <p className="mt-1 text-sm text-(--text-dim)">
                      {resolveClassSection(item.offeredSubject)}
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

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Date</p>
                    <p className="mt-1 text-sm">{formatClassDate(item.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Time</p>
                    <p className="mt-1 text-sm">{formatTimeRange(item.startTime, item.endTime)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                      Students
                    </p>
                    <p className="mt-1 text-sm">{item.totalStudents}</p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/instructor/classes/${item._id}${detailQuery ? `?${detailQuery}` : ""}`}
                  className="focus-ring mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                >
                  Open
                </Link>
              </article>
            ))}

            {payload.result.length === 0 ? (
              <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-8 text-center text-sm text-(--text-dim)">
                No classes matched the selected semester filters.
              </div>
            ) : null}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-(--line) bg-(--surface) md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-(--line) text-left text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3">Students</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {payload.result.map((item) => (
                  <tr key={item._id} className="border-b border-(--line)/70">
                    <td className="px-4 py-3 font-medium">
                      {typeof item.subject === "string"
                        ? item.subject
                        : `${item.subject?.title ?? "--"}${item.subject?.code ? ` (${item.subject.code})` : ""}`}
                    </td>
                    <td className="px-4 py-3 text-(--text-dim)">{formatClassDate(item.date)}</td>
                    <td className="px-4 py-3 text-(--text-dim)">
                      {formatTimeRange(item.startTime, item.endTime)}
                    </td>
                    <td className="px-4 py-3 text-(--text-dim)">
                      {resolveClassSection(item.offeredSubject)}
                    </td>
                    <td className="px-4 py-3 text-(--text-dim)">{item.totalStudents}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/instructor/classes/${item._id}${detailQuery ? `?${detailQuery}` : ""}`}
                        className="focus-ring inline-flex h-9 items-center justify-center rounded-xl border border-(--line) px-3 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
                {payload.result.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-(--text-dim)">
                      No classes matched the selected semester filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <ClassSessionPagination meta={payload.meta} page={page} limit={limit} />
        </>
      ) : null}
    </section>
  );
}
