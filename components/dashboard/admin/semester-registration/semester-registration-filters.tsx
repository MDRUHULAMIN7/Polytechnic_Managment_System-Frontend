"use client";

import type { SemesterRegistrationSort } from "@/lib/types/pages/semester-registration/semester-registration.types";

type SemesterRegistrationFiltersProps = {
  sort: SemesterRegistrationSort;
  limit: number;
  rowsPerPage: readonly number[];
  onSortChange: (value: SemesterRegistrationSort) => void;
  onLimitChange: (value: number) => void;
};

export function SemesterRegistrationFilters({
  sort,
  limit,
  rowsPerPage,
  onSortChange,
  onLimitChange,
}: SemesterRegistrationFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Sort:</span>
        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as SemesterRegistrationSort)
          }
          className="w-full rounded-md bg-(--surface) px-1.5 py-1"
          aria-label="Sort semester registrations"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-startDate">Start date (latest)</option>
          <option value="startDate">Start date (earliest)</option>
        </select>
      </label>

      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Rows:</span>
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="rounded-md bg-(--surface) px-1.5 py-1"
          aria-label="Rows per page"
        >
          {rowsPerPage.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
