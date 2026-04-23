"use client";

import type { EnrolledSubject } from "@/lib/type/dashboard/admin/enrolled-subject";
import { resolveName } from "@/utils/dashboard/admin/utils";
import { Modal } from "@/components/dashboard/admin/semester-enrollment/modal";

function formatShortDate(value?: string | null) {
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
    return { days: "--", time: "--", section: "--", released: 0, status: "--" };
  }
  if (typeof value === "string") {
    return { days: value, time: "--", section: "--", released: 0, status: "--" };
  }
  return {
    days: value.days?.length ? value.days.join(", ") : "--",
    time:
      value.startTime && value.endTime ? `${value.startTime} - ${value.endTime}` : "--",
    section: value.section ? `Sec ${value.section}` : "--",
    released: value.releasedComponentCodes?.length ?? 0,
    status: value.markingStatus ?? "--",
  };
}

const bucketLabels: Record<string, string> = {
  THEORY_CONTINUOUS: "Theory Continuous",
  THEORY_FINAL: "Theory Final",
  PRACTICAL_CONTINUOUS: "Practical Continuous",
  PRACTICAL_FINAL: "Practical Final",
};

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
  const academicSemester = renderAcademicSemester(subject?.academicSemester);
  const markEntries = subject?.markEntries ?? [];
  const markSummary = subject?.markSummary;

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
            Result Status: <span className="font-medium">{subject?.resultStatus ?? "--"}</span>
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
          <p className="mt-1 text-xs text-(--text-dim)">
            Released Components: <span className="font-medium">{schedule.released}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3 lg:col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Visible Marks
          </p>
          {markEntries.length ? (
            <div className="mt-3 space-y-3">
              {markEntries
                .slice()
                .sort((left, right) => left.order - right.order)
                .map((entry) => (
                  <div
                    key={entry.componentCode}
                    className="rounded-lg border border-(--line) bg-(--surface) px-3 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{entry.componentTitle}</p>
                        <p className="text-xs text-(--text-dim)">
                          {bucketLabels[entry.bucket] ?? entry.bucket} / {entry.componentType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {typeof entry.obtainedMarks === "number" ? entry.obtainedMarks : "--"} /{" "}
                          {entry.fullMarks}
                        </p>
                        <p className="text-xs text-(--text-dim)">
                          {entry.isReleased ? "Released" : "Hidden"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-(--text-dim)">
              No released marks yet. Your instructor will release components as they are
              finalized.
            </p>
          )}

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                Theory Continuous
              </p>
              <p className="mt-1 text-sm font-semibold">
                {markSummary?.releasedTheoryContinuous ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                Theory Final
              </p>
              <p className="mt-1 text-sm font-semibold">
                {markSummary?.releasedTheoryFinal ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                Practical Continuous
              </p>
              <p className="mt-1 text-sm font-semibold">
                {markSummary?.releasedPracticalContinuous ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
                Practical Final
              </p>
              <p className="mt-1 text-sm font-semibold">
                {markSummary?.releasedPracticalFinal ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <span className="text-(--text-dim)">Released Total</span>
            <span className="font-semibold">
              {markSummary?.releasedTotal ?? 0} / {markSummary?.releasedMarks ?? 0}
            </span>
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
            <p className="text-(--text-dim)">Final Grade</p>
            <p className="mt-1 font-semibold">
              {subject?.finalResultPublishedAt ? subject?.grade ?? "--" : "Pending publish"}{" "}
              {subject?.finalResultPublishedAt && typeof subject?.gradePoints === "number"
                ? `(${subject.gradePoints})`
                : ""}
            </p>
          </div>

          <div className="mt-3 rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <p className="text-(--text-dim)">Published</p>
            <p className="mt-1 font-semibold">{formatShortDate(subject?.finalResultPublishedAt)}</p>
          </div>

          <div className="mt-3 rounded-lg border border-(--line) bg-(--surface) px-3 py-2 text-sm">
            <p className="text-(--text-dim)">Section Marking Status</p>
            <p className="mt-1 font-semibold">{schedule.status}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
