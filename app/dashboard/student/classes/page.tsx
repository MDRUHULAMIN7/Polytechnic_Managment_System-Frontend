import Link from "next/link";
import type { Metadata } from "next";
import { getStudentClassSessionsServer } from "@/lib/api/dashboard/class-session/server";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import {
  formatClassDate,
  formatTimeRange,
  resolveClassInstructorName,
  resolveClassSubjectTitle,
  statusBadgeClass,
} from "@/utils/dashboard/class-session";

export const metadata: Metadata = {
  title: "Student Classes",
};

function buildPageHref(
  page: number,
  params: {
    status: string;
    searchTerm: string;
    startDate: string;
    endDate: string;
    limit: number;
  },
) {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.searchTerm) query.set("searchTerm", params.searchTerm);
  if (params.startDate) query.set("startDate", params.startDate);
  if (params.endDate) query.set("endDate", params.endDate);
  query.set("page", String(page));
  query.set("limit", String(params.limit));
  return `/dashboard/student/classes?${query.toString()}`;
}

export default async function StudentClassesPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const status = readParam(resolvedSearchParams, "status");
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const startDate = readParam(resolvedSearchParams, "startDate");
  const endDate = readParam(resolvedSearchParams, "endDate");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const payload = await getStudentClassSessionsServer({
    status: status || undefined,
    searchTerm: searchTerm || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit,
  });

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
          Student Module
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">My Classes</h1>
        <p className="mt-2 text-sm text-(--text-dim)">
          Track class status, instructor notes, and your own attendance result.
        </p>
      </div>

      <form
        action="/dashboard/student/classes"
        className="grid gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:grid-cols-[1.2fr_repeat(3,0.8fr)_auto]"
      >
        <input
          name="searchTerm"
          defaultValue={searchTerm}
          placeholder="Filter by subject"
          className="focus-ring h-11 rounded-xl border border-(--line) bg-transparent px-3 text-sm"
        />
        <input
          type="date"
          name="startDate"
          defaultValue={startDate}
          className="focus-ring h-11 rounded-xl border border-(--line) bg-transparent px-3 text-sm"
        />
        <input
          type="date"
          name="endDate"
          defaultValue={endDate}
          className="focus-ring h-11 rounded-xl border border-(--line) bg-transparent px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="focus-ring h-11 rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        >
          <option value="">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="ONGOING">Ongoing</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <input type="hidden" name="limit" value={limit} />
        <button
          type="submit"
          className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink)"
        >
          Apply
        </button>
      </form>

      <div className="flex items-center justify-between text-sm text-(--text-dim)">
        <p>
          Showing page {payload.meta.page} of {payload.meta.totalPage} · total{" "}
          {payload.meta.total} classes
        </p>
        <p>Limit: {payload.meta.limit}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-(--line) bg-(--surface)">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-(--line) text-left text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">My Attendance</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {payload.result.map((item) => (
              <tr key={item._id} className="border-b border-(--line)/70">
                <td className="px-4 py-3 font-medium">
                  {resolveClassSubjectTitle(item.subject)}
                </td>
                <td className="px-4 py-3 text-(--text-dim)">
                  {resolveClassInstructorName(item.instructor)}
                </td>
                <td className="px-4 py-3 text-(--text-dim)">{formatClassDate(item.date)}</td>
                <td className="px-4 py-3 text-(--text-dim)">
                  {formatTimeRange(item.startTime, item.endTime)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-(--text-dim)">
                  {item.myAttendance?.status ?? "Not marked"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/student/classes/${item._id}`}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-xl border border-(--line) px-3 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {payload.result.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-(--text-dim)">
                  No classes matched the selected filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Link
          href={buildPageHref(Math.max(page - 1, 1), {
            status,
            searchTerm,
            startDate,
            endDate,
            limit,
          })}
          aria-disabled={page <= 1}
          className={`focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold transition ${
            page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-(--surface-muted)"
          }`}
        >
          Previous
        </Link>
        <Link
          href={buildPageHref(Math.min(page + 1, payload.meta.totalPage), {
            status,
            searchTerm,
            startDate,
            endDate,
            limit,
          })}
          aria-disabled={page >= payload.meta.totalPage}
          className={`focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold transition ${
            page >= payload.meta.totalPage
              ? "pointer-events-none opacity-50"
              : "hover:bg-(--surface-muted)"
          }`}
        >
          Next
        </Link>
      </div>
    </section>
  );
}
