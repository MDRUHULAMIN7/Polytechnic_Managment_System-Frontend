"use client";

import { useState } from "react";
import type {
  AttendanceRecord,
  ClassSessionStatistics,
} from "@/lib/type/dashboard/class-session";
import { getClassAttendance } from "@/lib/api/dashboard/student-attendance";
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
import { resolveName } from "@/utils/dashboard/admin/utils";
import { formatClassDate } from "@/utils/dashboard/class-session";
import { showToast } from "@/utils/common/toast";

type AdminClassAttendancePanelProps = {
  classSessionId: string;
  initialStatistics: ClassSessionStatistics;
};

function renderStudentName(row: AttendanceRecord) {
  if (typeof row.student === "string") {
    return { name: row.student, id: "--", email: "--", contactNo: "--" };
  }

  return {
    name: resolveName(row.student?.name),
    id: row.student?.id ?? "--",
    email: row.student?.email ?? "--",
    contactNo: row.student?.contactNo ?? "--",
  };
}

export function AdminClassAttendancePanel({
  classSessionId,
  initialStatistics,
}: AdminClassAttendancePanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[] | null>(null);
  const [statistics, setStatistics] = useState(initialStatistics);

  async function loadAttendance() {
    setLoading(true);
    setError(null);

    try {
      const payload = await getClassAttendance(classSessionId);
      setAttendance(payload.attendance ?? []);
      setStatistics(payload.statistics ?? initialStatistics);
    } catch (err) {
      const nextError =
        err instanceof Error ? err.message : "Unable to load the student list.";
      setError(nextError);
      showToast({
        variant: "error",
        title: "Student list load failed",
        description: nextError,
      });
    } finally {
      setLoading(false);
    }
  }

  const attendanceRows = attendance ?? [];

  return (
    <section className="mt-5 rounded-2xl border border-(--line) bg-(--surface) p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Student Attendance List</h2>
          <p className="mt-1 text-sm text-(--text-dim)">
            Student rows load on demand so large classes do not slow down the page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadAttendance();
          }}
          disabled={loading}
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading
            ? "Loading..."
            : attendance
              ? "Refresh Student List"
              : "Load Student List"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Total Students
          </p>
          <p className="mt-2 font-medium">{statistics.totalStudents}</p>
        </div>
        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Present
          </p>
          <p className="mt-2 font-medium">{statistics.presentCount}</p>
        </div>
        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Absent / Leave
          </p>
          <p className="mt-2 font-medium">
            {statistics.absentCount} / {statistics.leaveCount}
          </p>
        </div>
        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Not Marked
          </p>
          <p className="mt-2 font-medium">{statistics.notMarkedCount}</p>
        </div>
      </div>

      <div className="mt-4">
        <DashboardErrorBanner
          error={error}
          action={
            error ? (
              <button
                type="button"
                onClick={() => {
                  void loadAttendance();
                }}
                className="ml-3 inline-flex items-center rounded-lg border border-red-400/60 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                Retry
              </button>
            ) : null
          }
        />
      </div>

      {!attendance && !loading && !error ? (
        <div className="mt-4 rounded-xl border border-dashed border-(--line) bg-(--surface-muted) px-4 py-6 text-sm text-(--text-dim)">
          Load the student list when you need the detailed attendance rows.
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-6 text-sm text-(--text-dim)">
          Loading student attendance...
        </div>
      ) : null}

      {attendance && attendanceRows.length === 0 && !loading ? (
        <div className="mt-4 rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-6 text-sm text-(--text-dim)">
          No attendance rows found for this class yet.
        </div>
      ) : null}

      {attendance && attendanceRows.length > 0 ? (
        <>
          <div className="mt-5 space-y-3 md:hidden">
            {attendanceRows.map((row) => {
              const student = renderStudentName(row);

              return (
                <article
                  key={row._id}
                  className="rounded-xl border border-(--line) bg-(--surface-muted) p-4"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="mt-1 text-xs text-(--text-dim)">{student.id}</p>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-(--text-dim)">
                    <p>{student.email}</p>
                    <p>{student.contactNo}</p>
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
              );
            })}
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
                {attendanceRows.map((row) => {
                  const student = renderStudentName(row);

                  return (
                    <tr key={row._id} className="border-b border-(--line)/70">
                      <td className="px-4 py-3">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-(--text-dim)">{student.id}</p>
                      </td>
                      <td className="px-4 py-3 text-(--text-dim)">
                        {student.email} | {student.contactNo}
                      </td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3 text-(--text-dim)">
                        {row.markedAt ? formatClassDate(row.markedAt) : "--"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
