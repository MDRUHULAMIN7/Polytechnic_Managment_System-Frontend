import type { SemesterEnrollmentDetailsContentProps } from "@/lib/type/dashboard/admin/semester-enrollment/ui";
import { resolveName } from "@/utils/dashboard/admin/utils";

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

function renderStudent(value: unknown) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const student = value as { id?: string; name?: { firstName?: string; middleName?: string; lastName?: string } };
    const name = resolveName(student.name);
    return student.id ? `${student.id} - ${name}` : name || "--";
  }
  return "--";
}

function renderCurriculum(value: unknown) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const curriculum = value as { session?: string; regulation?: number };
    const session = curriculum.session ?? "--";
    const regulation = typeof curriculum.regulation === "number" ? `Reg ${curriculum.regulation}` : "";
    return [session, regulation].filter(Boolean).join(" ") || "--";
  }
  return "--";
}

export function SemesterEnrollmentDetailsContent({
  details,
  error,
}: SemesterEnrollmentDetailsContentProps) {
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

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Student</p>
          <p className="mt-2 font-medium">{renderStudent(details.student)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Department</p>
          <p className="mt-2 font-medium">{renderValue(details.academicDepartment)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Semester</p>
          <p className="mt-2 font-medium">{renderValue(details.academicSemester)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Semester Registration</p>
          <p className="mt-2 font-medium">{renderValue(details.semesterRegistration)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Curriculum</p>
          <p className="mt-2 font-medium">{renderCurriculum(details.curriculum)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Status</p>
          <p className="mt-2 font-medium">{details.status}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Fees</p>
          <p className="mt-2 font-medium">{details.fees}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Paid</p>
          <p className="mt-2 font-medium">{details.isPaid ? "Yes" : "No"}</p>
        </div>
      </div>
    </div>
  );
}
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
