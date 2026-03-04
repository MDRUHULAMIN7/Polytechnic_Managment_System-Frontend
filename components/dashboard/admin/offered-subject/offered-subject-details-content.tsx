import type { OfferedSubjectDetailsContentProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { renderValue } from "@/utils/dashboard/admin/offered-subject";
import { resolveName } from "@/utils/dashboard/admin/utils";




export function OfferedSubjectDetailsContent({
  details,
  error,
}: OfferedSubjectDetailsContentProps) {
  if (error) {
    return (
      <div className="rounded-2xl border border-red-400/50 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!details) {
    return (
      <div className="rounded-2xl border border-(--line) bg-(--surface) px-4 py-6 text-center text-sm text-(--text-dim)">
        No details available.
      </div>
    );
  }

  const instructorLabel =
    typeof details.instructor === "string"
      ? details.instructor
      : resolveName(details.instructor?.name);

  const semesterRegistrationLabel =
    typeof details.semesterRegistration === "string"
      ? details.semesterRegistration
      : `${details.semesterRegistration?.status ?? "--"} - ${
          details.semesterRegistration?.shift ?? "--"
        }`;

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Subject
          </p>
          <p className="mt-2 font-medium">{renderValue(details.subject)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Instructor
          </p>
          <p className="mt-2 font-medium">{instructorLabel}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Academic Semester
          </p>
          <p className="mt-2 font-medium">{renderValue(details.academicSemester)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Semester Registration
          </p>
          <p className="mt-2 font-medium">{semesterRegistrationLabel}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Department
          </p>
          <p className="mt-2 font-medium">{renderValue(details.academicDepartment)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Academic Instructor
          </p>
          <p className="mt-2 font-medium">{renderValue(details.academicInstructor)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Section
          </p>
          <p className="mt-2 font-medium">{details.section}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Max Capacity
          </p>
          <p className="mt-2 font-medium">{details.maxCapacity}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Schedule
          </p>
          <p className="mt-2 font-medium">
            {details.days?.length ? details.days.join(", ") : "--"}{" "}
            {details.startTime && details.endTime
              ? `(${details.startTime} - ${details.endTime})`
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
