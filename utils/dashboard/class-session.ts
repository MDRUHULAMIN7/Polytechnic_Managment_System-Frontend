import type {
  ClassSession,
  ClassSessionStatus,
} from "@/lib/type/dashboard/class-session";
import { resolveName } from "@/utils/dashboard/admin/utils";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";

export function formatClassDate(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTimeRange(start?: string, end?: string) {
  if (!start || !end) {
    return "--";
  }
  return `${start} - ${end}`;
}

export function resolveClassSubjectTitle(subject: ClassSession["subject"]) {
  if (typeof subject === "string") {
    return subject;
  }
  return [subject?.title, subject?.code].filter(Boolean).join(" | ") || "--";
}

export function resolveClassInstructorName(instructor: ClassSession["instructor"]) {
  if (typeof instructor === "string") {
    return instructor;
  }
  return `${resolveName(instructor?.name)}${instructor?.designation ? ` (${instructor.designation})` : ""}`;
}

export function resolveSemesterRegistrationLabel(
  registration?: SemesterRegistration | string,
) {
  if (!registration) {
    return "--";
  }

  if (typeof registration === "string") {
    return registration;
  }

  const semester =
    typeof registration.academicSemester === "string"
      ? registration.academicSemester
      : [registration.academicSemester?.name, registration.academicSemester?.year]
          .filter(Boolean)
          .join(" ");

  return [semester || "Semester", registration.status, registration.shift]
    .filter(Boolean)
    .join(" | ");
}

export function statusBadgeClass(status: ClassSessionStatus) {
  if (status === "ONGOING") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }
  if (status === "COMPLETED") {
    return "border-sky-500/40 bg-sky-500/10 text-sky-300";
  }
  if (status === "CANCELLED") {
    return "border-red-500/40 bg-red-500/10 text-red-300";
  }
  if (status === "MISSED") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-300";
  }
  return "border-(--line) bg-(--surface-muted) text-(--text-dim)";
}
