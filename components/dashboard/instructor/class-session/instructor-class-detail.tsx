"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  completeClassSessionAction,
  startClassSessionAction,
} from "@/actions/dashboard/class-session";
import { submitStudentAttendanceAction } from "@/actions/dashboard/student-attendance";
import type {
  AttendanceStatus,
  InstructorClassDetails,
} from "@/lib/type/dashboard/class-session";
import { showToast } from "@/utils/common/toast";
import {
  formatClassDate,
  formatTimeRange,
  resolveClassSection,
  resolveClassSubjectTitle,
  statusBadgeClass,
} from "@/utils/dashboard/class-session";
import { resolveName } from "@/utils/dashboard/admin/utils";

type InstructorClassDetailProps = {
  details: InstructorClassDetails;
};

const attendanceOptions: AttendanceStatus[] = ["PRESENT", "ABSENT", "LEAVE"];
type AttendanceDraftStatus = AttendanceStatus | "";

export function InstructorClassDetail({ details }: InstructorClassDetailProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [topic, setTopic] = useState(details.classSession.topic ?? "");
  const [remarks, setRemarks] = useState(details.classSession.remarks ?? "");
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceDraftStatus>>(
    () =>
      Object.fromEntries(
        details.students.map((student) => [
          student.studentId,
          student.attendanceStatus === "NOT_MARKED" ? "" : student.attendanceStatus,
        ]),
      ),
  );

  const attendanceCounts = useMemo(() => {
    return details.students.reduce(
      (acc, student) => {
        const status = attendanceMap[student.studentId];
        if (status) {
          acc[status] += 1;
        } else {
          acc.pending += 1;
        }
        return acc;
      },
      { PRESENT: 0, ABSENT: 0, LEAVE: 0, pending: 0 },
    );
  }, [attendanceMap, details.students]);

  const canStart = details.classSession.status === "SCHEDULED";
  const canComplete =
    details.classSession.status === "ONGOING" && attendanceCounts.pending === 0;
  const canSubmit =
    details.classSession.status === "ONGOING" ||
    details.classSession.status === "COMPLETED";

  function updateAttendance(studentId: string, status: AttendanceDraftStatus) {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  }

  function handleStartClass() {
    startTransition(async () => {
      try {
        await startClassSessionAction(details.classSession._id, {
          topic: topic.trim() || undefined,
          remarks: remarks.trim() || undefined,
        });
        showToast({
          variant: "success",
          title: "Class started",
          description: "Attendance sheet is now active.",
        });
        router.refresh();
      } catch (error) {
        showToast({
          variant: "error",
          title:
            error instanceof Error ? error.message : "Failed to start class.",
          description: "Please try again.",
        });
      }
    });
  }

  function handleSubmitAttendance() {
    startTransition(async () => {
      try {
        const missingStudents = details.students.filter(
          (student) => !attendanceMap[student.studentId],
        );

        if (missingStudents.length > 0) {
          showToast({
            variant: "error",
            title: "Attendance incomplete",
            description: "Select a status for every student before submitting.",
          });
          return;
        }

        await submitStudentAttendanceAction({
          classSessionId: details.classSession._id,
          attendance: details.students.map((student) => ({
            studentId: student.studentId,
            status: attendanceMap[student.studentId] as AttendanceStatus,
          })),
        });

        showToast({
          variant: "success",
          title: "Attendance submitted",
          description: "Attendance saved. Use Complete Class to finish the class.",
        });
        router.refresh();
      } catch (error) {
        showToast({
          variant: "error",
          title:
            error instanceof Error
              ? error.message
              : "Failed to submit attendance.",
          description: "Please review the sheet and try again.",
        });
      }
    });
  }

  function handleCompleteClass() {
    startTransition(async () => {
      try {
        await completeClassSessionAction(details.classSession._id);
        showToast({
          variant: "success",
          title: "Class completed",
          description: "You can still update attendance after completion.",
        });
        router.refresh();
      } catch (error) {
        showToast({
          variant: "error",
          title:
            error instanceof Error ? error.message : "Failed to complete class.",
          description: "Please try again.",
        });
      }
    });
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {resolveClassSubjectTitle(details.classSession.subject)}
            </h2>
            <p className="mt-2 text-sm text-(--text-dim)">
              {formatClassDate(details.classSession.date)} ·{" "}
              {formatTimeRange(
                details.classSession.startTime,
                details.classSession.endTime,
              )}{" "}
              · {resolveClassSection(details.classSession.offeredSubject)}
            </p>
          </div>
          <span
            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusBadgeClass(
              details.classSession.status,
            )}`}
          >
            {details.classSession.status}
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Session
            </p>
            <p className="mt-2 font-medium">
              Class #{details.classSession.sessionNumber}
            </p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Total Students
            </p>
            <p className="mt-2 font-medium">{details.students.length}</p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Schedule
            </p>
            <p className="mt-2 font-medium">
              {typeof details.classSession.offeredSubject === "string"
                ? details.classSession.offeredSubject
                : details.classSession.offeredSubject?.days?.join(", ") || "--"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
        <section className="rounded-2xl border border-(--line) bg-(--surface) p-5">
          <h2 className="text-lg font-semibold tracking-tight">Class Control</h2>
          <p className="mt-2 text-sm text-(--text-dim)">
            Start the class first, submit attendance for every student, then use
            Complete Class to finish the session.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Topic
              </label>
              <input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                disabled={!canStart || isPending}
                className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm disabled:opacity-60"
                placeholder="Introduction to Arrays"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                Remarks
              </label>
              <textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                disabled={!canStart || isPending}
                className="focus-ring mt-2 min-h-28 w-full rounded-xl border border-(--line) bg-transparent px-3 py-3 text-sm disabled:opacity-60"
                placeholder="Optional classroom note"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={!canStart || isPending}
                onClick={handleStartClass}
                className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              >
                {isPending && canStart ? "Starting..." : "Start Class"}
              </button>
              <button
                type="button"
                disabled={!canComplete || isPending}
                onClick={handleCompleteClass}
                className="focus-ring inline-flex h-11 w-full items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
              >
                {isPending && canComplete ? "Completing..." : "Complete Class"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-(--line) bg-(--surface) p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Attendance Sheet
              </h2>
              <p className="mt-1 text-sm text-(--text-dim)">
                Only the assigned instructor can submit and update attendance.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {attendanceOptions.map((status) => (
                <span
                  key={status}
                  className="rounded-full border border-(--line) bg-(--surface-muted) px-3 py-1 font-semibold"
                >
                  {status}: {attendanceCounts[status]}
                </span>
              ))}
              <span className="rounded-full border border-(--line) bg-(--surface-muted) px-3 py-1 font-semibold">
                Pending: {attendanceCounts.pending}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {details.students.map((student) => (
              <article
                key={student.studentId}
                className="rounded-xl border border-(--line) bg-(--surface-muted) p-4"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{resolveName(student.name)}</p>
                  <p className="text-xs text-(--text-dim)">{student.studentCode}</p>
                </div>
                <div className="mt-3 space-y-1 text-sm text-(--text-dim)">
                  <p>{student.email || "--"}</p>
                  <p>{student.contactNo || "--"}</p>
                </div>
                <select
                  value={attendanceMap[student.studentId]}
                  onChange={(event) =>
                    updateAttendance(
                      student.studentId,
                      event.target.value as AttendanceDraftStatus,
                    )
                  }
                  disabled={!canSubmit || isPending}
                  className="focus-ring mt-4 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm disabled:opacity-60"
                >
                  <option value="">Select status</option>
                  {attendanceOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </article>
            ))}
          </div>

          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-(--line) text-left text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                  <th className="px-3 py-3">Student</th>
                  <th className="px-3 py-3">Contact</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {details.students.map((student) => (
                  <tr key={student.studentId} className="border-b border-(--line)/70">
                    <td className="px-3 py-3">
                      <p className="font-medium">{resolveName(student.name)}</p>
                      <p className="text-xs text-(--text-dim)">
                        {student.studentCode}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-(--text-dim)">
                      <p>{student.email || "--"}</p>
                      <p className="text-xs">{student.contactNo || "--"}</p>
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={attendanceMap[student.studentId]}
                        onChange={(event) =>
                          updateAttendance(
                            student.studentId,
                            event.target.value as AttendanceDraftStatus,
                          )
                        }
                        disabled={!canSubmit || isPending}
                        className="focus-ring h-10 rounded-xl border border-(--line) bg-(--surface) px-3 text-sm disabled:opacity-60"
                      >
                        <option value="">Select status</option>
                        {attendanceOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmitAttendance}
              className="focus-ring inline-flex h-11 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending && canSubmit
                ? "Saving..."
                : details.classSession.status === "COMPLETED"
                  ? "Update Attendance"
                  : "Submit Attendance"}
            </button>
          </div>
          {details.classSession.status === "ONGOING" && attendanceCounts.pending > 0 ? (
            <p className="mt-3 text-sm text-(--text-dim)">
              Complete Class stays locked until attendance is submitted for every student.
            </p>
          ) : null}
        </section>
      </div>
    </section>
  );
}
