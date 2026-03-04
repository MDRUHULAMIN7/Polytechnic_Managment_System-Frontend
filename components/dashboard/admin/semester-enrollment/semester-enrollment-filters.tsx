import type { SemesterEnrollmentFiltersProps } from "@/lib/type/dashboard/admin/semester-enrollment/ui";
import { SEMESTER_ENROLLMENT_STATUSES } from "@/lib/type/dashboard/admin/semester-enrollment/constants";

export function SemesterEnrollmentFilters({
  search,
  sort,
  status,
  onSearchChange,
  onSortChange,
  onStatusChange,
}: SemesterEnrollmentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Search
        </label>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by student or session"
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        />
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Status
          </label>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as SemesterEnrollmentFiltersProps["status"])}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="">All Status</option>
            {SEMESTER_ENROLLMENT_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Sort
          </label>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as SemesterEnrollmentFiltersProps["sort"])
            }
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
