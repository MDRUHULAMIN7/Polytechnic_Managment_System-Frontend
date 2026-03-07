import type { SubjectDetailsContentProps } from "@/lib/type/dashboard/admin/subject/ui";

function renderCode(code: number) {
  if (!code) {
    return "--";
  }
  return String(code);
}

function resolvePreReqTitle(value: unknown) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "title" in value) {
    return (value as { title?: string }).title ?? "--";
  }

  return "--";
}

export function SubjectDetailsContent({ details, error }: SubjectDetailsContentProps) {
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

  const prereqs = details.preRequisiteSubjects ?? [];

  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Title</p>
          <p className="mt-2 font-medium">{details.title}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Code</p>
          <p className="mt-2 font-medium">{renderCode(details.code)}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Credits</p>
          <p className="mt-2 font-medium">{details.credits}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Regulation
          </p>
          <p className="mt-2 font-medium">{details.regulation}</p>
        </div>
      </div>

      <div className="rounded-xl border border-(--line) px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
          Prerequisites
        </p>
        {prereqs.length === 0 ? (
          <p className="mt-2 text-sm text-(--text-dim)">No prerequisites.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {prereqs.map((item, index) => (
              <li key={`${index}-${String(item.subject)}`} className="text-sm">
                {resolvePreReqTitle(item.subject)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
import { DashboardErrorBanner } from "@/components/dashboard/shared/dashboard-error-banner";
