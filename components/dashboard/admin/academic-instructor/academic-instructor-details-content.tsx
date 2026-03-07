import type { AcademicInstructorDetailsContentProps } from "@/lib/type/dashboard/admin/academic-instructor/ui";
import { formatDate } from "@/utils/common/utils";

export function AcademicInstructorDetailsContent({
  details,
  error,
}: AcademicInstructorDetailsContentProps) {
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
      <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
          Name
        </p>
        <p className="mt-2 text-base font-semibold">{details.name}</p>
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
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
