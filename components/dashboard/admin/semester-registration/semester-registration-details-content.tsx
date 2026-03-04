import type { SemesterRegistrationDetailsContentProps } from "@/lib/type/dashboard/admin/semester-registration/ui";

function renderSemester(value: unknown) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "name" in value && "year" in value) {
    const name = (value as { name?: string }).name ?? "--";
    const year = (value as { year?: string }).year ?? "";
    return `${name} ${year}`.trim();
  }

  return "--";
}

function renderDate(value?: string) {
  if (!value) {
    return "--";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

export function SemesterRegistrationDetailsContent({
  details,
  error,
}: SemesterRegistrationDetailsContentProps) {
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
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Academic Semester
          </p>
          <p className="mt-2 font-medium">{renderSemester(details.academicSemester)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Status
          </p>
          <p className="mt-2 font-medium">{details.status}</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            Shift
          </p>
          <p className="mt-2 font-medium">{details.shift}</p>
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
            Start Date
          </p>
          <p className="mt-2 font-medium">{renderDate(details.startDate)}</p>
        </div>
        <div className="rounded-xl border border-(--line) px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
            End Date
          </p>
          <p className="mt-2 font-medium">{renderDate(details.endDate)}</p>
        </div>
      </div>
    </div>
  );
}
