import type { SemesterRegistrationFiltersProps } from "@/lib/type/dashboard/admin/semester-registration/ui";
import {
  SEMESTER_REGISTRATION_SHIFTS,
  SEMESTER_REGISTRATION_STATUSES,
} from "@/lib/type/dashboard/admin/semester-registration/constants";

export function SemesterRegistrationFilters({
  search,
  sort,
  status,
  shift,
  onSearchChange,
  onSortChange,
  onStatusChange,
  onShiftChange,
}: SemesterRegistrationFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Search
        </label>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by semester, status, or shift"
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        />
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Status
          </label>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value as SemesterRegistrationFiltersProps["status"])}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="">All Status</option>
            {SEMESTER_REGISTRATION_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Shift
          </label>
          <select
            value={shift}
            onChange={(event) => onShiftChange(event.target.value as SemesterRegistrationFiltersProps["shift"])}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="">All Shifts</option>
            {SEMESTER_REGISTRATION_SHIFTS.map((item) => (
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
              onSortChange(event.target.value as SemesterRegistrationFiltersProps["sort"])
            }
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-startDate">Start Date (Desc)</option>
            <option value="startDate">Start Date (Asc)</option>
            <option value="-endDate">End Date (Desc)</option>
            <option value="endDate">End Date (Asc)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
