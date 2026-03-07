import type { CurriculumDetailsContentProps } from "@/lib/type/dashboard/admin/curriculum/ui";
import { resolveId } from "@/utils/dashboard/admin/utils";
import { CurriculumOutline } from "./curriculum-outline";

function renderValue(value: unknown, fallback = "--") {
  if (!value) {
    return fallback;
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object" && "name" in value && "year" in value) {
    const name = (value as { name?: string }).name ?? "";
    const year = (value as { year?: string }).year ?? "";
    return `${name} ${year}`.trim() || fallback;
  }
  if (typeof value === "object" && "name" in value) {
    return (value as { name?: string }).name ?? fallback;
  }
  if (typeof value === "object" && "status" in value && "shift" in value) {
    const status = (value as { status?: string }).status ?? "--";
    const shift = (value as { shift?: string }).shift ?? "--";
    return `${status} - ${shift}`;
  }
  return fallback;
}

export function CurriculumDetailsContent({
  details,
  error,
  outlineMode = "admin",
}: CurriculumDetailsContentProps) {
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

  const subjects = details.subjects ?? [];
  const semesterRegistrationId = resolveId(details.semisterRegistration);
  const academicDepartmentId = resolveId(details.academicDepartment);

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Session
          </p>
          <p className="mt-2 font-medium">{details.session}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Regulation
          </p>
          <p className="mt-2 font-medium">{details.regulation}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Department
          </p>
          <p className="mt-2 font-medium">{renderValue(details.academicDepartment)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Academic Semester
          </p>
          <p className="mt-2 font-medium">{renderValue(details.academicSemester)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Semester Registration
          </p>
          <p className="mt-2 font-medium">{renderValue(details.semisterRegistration)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Total Credit
          </p>
          <p className="mt-2 font-medium">{details.totalCredit}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Subjects
          </p>
          <p className="mt-2 font-medium">{subjects.length}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Offered Subjects
          </p>
          <p className="mt-2 text-xs text-(--text-dim)">
            Open full outline to load.
          </p>
        </div>
      </div>

      <CurriculumOutline
        subjects={subjects}
        semesterRegistrationId={semesterRegistrationId}
        academicDepartmentId={academicDepartmentId}
        mode={outlineMode}
      />
    </div>
  );
}
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
