import type { CurriculumDetailsContentProps } from "@/lib/type/dashboard/admin/curriculum/ui";

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

function renderSubjectTitle(value: unknown) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  if (typeof value === "object" && "title" in value) {
    return (value as { title?: string }).title ?? "--";
  }
  return "--";
}

export function CurriculumDetailsContent({ details, error }: CurriculumDetailsContentProps) {
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

  const subjects = details.subjects ?? [];

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

      <div className="rounded-xl border border-(--line) px-4 py-3">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
          Subjects
        </p>
        {subjects.length === 0 ? (
          <p className="mt-2 text-sm text-(--text-dim)">No subjects.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {subjects.map((item, index) => (
              <li key={`${index}-${String(item)}`} className="text-sm">
                {renderSubjectTitle(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
