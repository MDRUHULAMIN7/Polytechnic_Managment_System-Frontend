"use client";

import { Search } from "lucide-react";

type AcademicSemesterFiltersProps = {
  search: string;
  limit: number;
  rowsPerPage: readonly number[];
  onSearchChange: (value: string) => void;
  onLimitChange: (value: number) => void;
};

export function AcademicSemesterFilters({
  search,
  limit,
  rowsPerPage,
  onSearchChange,
  onLimitChange,
}: AcademicSemesterFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
      <label className="focus-ring flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2">
        <Search className="h-4 w-4 text-(--text-dim)" aria-hidden />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search semester..."
          className="w-full bg-transparent text-sm outline-none"
          aria-label="Search semester"
        />
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
