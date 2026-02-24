"use client";

import type { SemesterEnrollmentSort } from "@/lib/types/pages/semester-enrollment/semester-enrollment.types";

type SemesterEnrollmentFiltersProps = {
  sort: SemesterEnrollmentSort;
  limit: number;
  rowsPerPage: readonly number[];
  onSortChange: (value: SemesterEnrollmentSort) => void;
  onLimitChange: (value: number) => void;
};

export function SemesterEnrollmentFilters({
  sort,
  limit,
  rowsPerPage,
  onSortChange,
  onLimitChange,
}: SemesterEnrollmentFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Sort:</span>
        <select
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as SemesterEnrollmentSort)
          }
          className="rounded-md bg-(--surface) px-1.5 py-1 text-sm text-(--text) outline-none"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-fees">Fees High-Low</option>
          <option value="fees">Fees Low-High</option>
        </select>
      </label>

      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Rows:</span>
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="rounded-md bg-(--surface) px-1.5 py-1 text-sm text-(--text) outline-none"
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

