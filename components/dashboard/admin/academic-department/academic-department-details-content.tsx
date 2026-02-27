import type { AcademicDepartmentDetailsContentProps } from "@/lib/type/dashboard/admin/academic-department/ui";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import { formatDate } from "@/utils/common/utils";

function resolveInstructorName(department: AcademicDepartment) {
  if (!department.academicInstructor) {
    return "â€”";
  }

  if (typeof department.academicInstructor === "string") {
    return department.academicInstructor;
  }

  return department.academicInstructor.name ?? "â€”";
}

export function AcademicDepartmentDetailsContent({
  details,
  error,
}: AcademicDepartmentDetailsContentProps) {
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

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
          Department
        </p>
        <p className="mt-2 text-base font-semibold">{details.name}</p>
      </div>

      <div className="rounded-xl border border-(--line) px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
          Academic Instructor
        </p>
        <p className="mt-2 font-medium">{resolveInstructorName(details)}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Created
          </p>
          <p className="mt-2 font-medium">{formatDate(details.createdAt)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Updated
          </p>
          <p className="mt-2 font-medium">{formatDate(details.updatedAt)}</p>
        </div>
      </div>

      <div className="rounded-xl border border-(--line) px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
          ID
        </p>
        <p className="mt-2 break-all font-mono text-xs">{details._id}</p>
      </div>
    </div>
  );
}
