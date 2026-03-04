"use client";

import type { EnrolledSubject } from "@/lib/type/dashboard/admin/enrolled-subject";
import { resolveName } from "@/utils/dashboard/admin/utils";
import { Modal } from "@/components/dashboard/admin/semester-enrollment/modal";

function formatShortDate(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString();
}

function renderSubjectTitle(value?: EnrolledSubject["subject"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  const code = value.code ? `${value.code}` : "";
  return code ? `${value.title} (${code})` : value.title ?? "--";
}

function renderCredits(value?: EnrolledSubject["subject"]) {
  if (!value || typeof value === "string") {
    return "--";
  }
  return value.credits ?? "--";
}

function renderRegulation(value?: EnrolledSubject["subject"]) {
  if (!value || typeof value === "string") {
    return "--";
  }
  return value.regulation ?? "--";
}

function renderInstructor(value?: EnrolledSubject["instructor"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  return resolveName(value.name);
}

function renderInstructorMeta(value?: EnrolledSubject["instructor"]) {
  if (!value || typeof value === "string") {
    return { designation: "--", email: "--" };
  }
  return {
    designation: value.designation ?? "--",
    email: value.email ?? "--",
  };
}

function renderRegistration(value?: EnrolledSubject["semesterRegistration"]) {
  if (!value) {
    return { status: "--", shift: "--", dates: "--", totalCredit: "--" };
  }
  if (typeof value === "string") {
    return { status: value, shift: "--", dates: "--", totalCredit: "--" };
  }
  return {
    status: value.status ?? "--",
    shift: value.shift ?? "--",
    dates: `${formatShortDate(value.startDate)} -> ${formatShortDate(value.endDate)}`,
    totalCredit:
      typeof value.totalCredit === "number" ? `${value.totalCredit} credits` : "--",
  };
}

function renderAcademicSemester(value?: EnrolledSubject["academicSemester"]) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  return `${value.name ?? ""} ${value.year ?? ""}`.trim() || "--";
}

function renderSchedule(value?: EnrolledSubject["offeredSubject"]) {
  if (!value) {
    return { days: "--", time: "--", section: "--" };
  }
  if (typeof value === "string") {
    return { days: value, time: "--", section: "--" };
  }
  return {
    days: value.days?.length ? value.days.join(", ") : "--",
    time:
      value.startTime && value.endTime ? `${value.startTime} - ${value.endTime}` : "--",
    section: value.section ? `Sec ${value.section}` : "--",
  };
}

function buildMarksBreakdown(value?: EnrolledSubject["subjectMarks"]) {
  const toNumber = (input?: number) =>
    typeof input === "number" && Number.isFinite(input) ? input : null;

  const classTest1 = toNumber(value?.classTest1);
  const classTest2 = toNumber(value?.classTest2);
  const midTerm = toNumber(value?.midTerm);
  const finalTerm = toNumber(value?.finalTerm);

  const total = [classTest1, classTest2, midTerm, finalTerm]
    .filter((item): item is number => item !== null)
    .reduce((sum, item) => sum + item, 0);

  const hasAny =
    classTest1 !== null ||
    classTest2 !== null ||
    midTerm !== null ||
    finalTerm !== null;

  return {
    classTest1: classTest1 ?? "--",
    classTest2: classTest2 ?? "--",
    midTerm: midTerm ?? "--",
    finalTerm: finalTerm ?? "--",
    total: hasAny ? total : "--",
  };
}

export function EnrolledSubjectDetailsModal({
  open,
  subject,
  onClose,
}: {
  open: boolean;
  subject: EnrolledSubject | null;
  onClose: () => void;
}) {
  const registration = renderRegistration(subject?.semesterRegistration);
  const schedule = renderSchedule(subject?.offeredSubject);
  const instructorMeta = renderInstructorMeta(subject?.instructor);
  const marks = buildMarksBreakdown(subject?.subjectMarks);
  const academicSemester = renderAcademicSemester(subject?.academicSemester);
  const status = subject?.isCompleted
    ? "Completed"
    : subject?.isEnrolled
      ? "Enrolled"
      : "--";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enrolled Subject Details"
      description="Full details for your enrolled subject."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Subject
          </p>
          <p className="mt-2 text-sm font-semibold">
            {renderSubjectTitle(subject?.subject)}
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Credits: <span className="font-medium">{renderCredits(subject?.subject)}</span>
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Regulation:{" "}
            <span className="font-medium">{renderRegulation(subject?.subject)}</span>
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Status: <span className="font-medium">{status}</span>
          </p>
        </div>

        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Registration
          </p>
          <p className="mt-2 text-sm font-semibold">
            {registration.status} / {registration.shift}
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Dates: <span className="font-medium">{registration.dates}</span>
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Total Credit:{" "}
            <span className="font-medium">{registration.totalCredit}</span>
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Academic Semester:{" "}
            <span className="font-medium">{academicSemester}</span>
          </p>
        </div>

        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Schedule
          </p>
          <p className="mt-2 text-sm font-semibold">{schedule.days}</p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Time: <span className="font-medium">{schedule.time}</span>
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Section: <span className="font-medium">{schedule.section}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Marks Breakdown
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                Class Test 1
              </p>
              <p className="mt-1 text-sm font-semibold">{marks.classTest1}</p>
            </div>
            <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                Class Test 2
              </p>
              <p className="mt-1 text-sm font-semibold">{marks.classTest2}</p>
            </div>
            <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                Mid Term
              </p>
              <p className="mt-1 text-sm font-semibold">{marks.midTerm}</p>
            </div>
            <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                Final Term
              </p>
              <p className="mt-1 text-sm font-semibold">{marks.finalTerm}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <span className="text-(--text-dim)">Total</span>
            <span className="font-semibold">{marks.total}</span>
          </div>
        </div>

        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Instructor
          </p>
          <p className="mt-2 text-sm font-semibold">
            {renderInstructor(subject?.instructor)}
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Designation:{" "}
            <span className="font-medium">{instructorMeta.designation}</span>
          </p>
          <p className="mt-1 text-xs text-(--text-dim)">
            Email: <span className="font-medium">{instructorMeta.email}</span>
          </p>
          <div className="mt-3 rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <p className="text-(--text-dim)">Grade</p>
            <p className="mt-1 font-semibold">
              {subject?.grade ?? "--"}{" "}
              {typeof subject?.gradePoints === "number"
                ? `(${subject.gradePoints})`
                : ""}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
