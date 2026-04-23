import type { OfferedSubjectDetailsContentProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { renderValue } from "@/utils/dashboard/admin/offered-subject";
import { resolveName } from "@/utils/dashboard/admin/utils";




export function OfferedSubjectDetailsContent({
  details,
  error,
}: OfferedSubjectDetailsContentProps) {
  if (error) {
    return <DashboardErrorBanner error={error} />;
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

      <div className="rounded-xl border border-(--line) px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Marking Snapshot
            </p>
            <p className="mt-1 text-sm text-(--text-dim)">
              Frozen from the subject at the time this section was offered.
            </p>
          </div>
          <div className="rounded-lg border border-(--line) bg-(--surface-muted) px-3 py-2 text-sm">
            Status: <span className="font-semibold">{details.markingStatus ?? "--"}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
              Theory Continuous
            </p>
            <p className="mt-1 font-semibold">
              {details.markingSchemeSnapshot?.theoryContinuous ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
              Theory Final
            </p>
            <p className="mt-1 font-semibold">
              {details.markingSchemeSnapshot?.theoryFinal ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
              Practical Continuous
            </p>
            <p className="mt-1 font-semibold">
              {details.markingSchemeSnapshot?.practicalContinuous ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
              Practical Final
            </p>
            <p className="mt-1 font-semibold">
              {details.markingSchemeSnapshot?.practicalFinal ?? 0}
            </p>
          </div>
          <div className="rounded-lg border border-(--line) bg-(--surface) px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-(--text-dim)">
              Total
            </p>
            <p className="mt-1 font-semibold">
              {details.markingSchemeSnapshot?.totalMarks ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Assessment Components
          </p>
          {details.assessmentComponentsSnapshot?.length ? (
            details.assessmentComponentsSnapshot
              .slice()
              .sort((left, right) => left.order - right.order)
              .map((component) => (
                <div
                  key={component.code}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-(--line) bg-(--surface) px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{component.title}</p>
                    <p className="text-xs text-(--text-dim)">
                      {component.bucket} / {component.componentType}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">{component.fullMarks}</p>
                    <p className="text-xs text-(--text-dim)">
                      {details.releasedComponentCodes?.includes(component.code)
                        ? "Released"
                        : "Not released"}
                    </p>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-sm text-(--text-dim)">No component snapshot found.</p>
          )}
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
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
