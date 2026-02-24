"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import {
  ACADEMIC_INSTRUCTOR_SORT_OPTIONS,
  type AcademicInstructorSort,
} from "@/lib/utils/academic-instructor/academic-instructor-utils";
import type { TableQueryState } from "@/lib/utils/table/table-utils";

type AcademicInstructorFiltersProps = {
  tableState: TableQueryState;
  rowsPerPage: readonly number[];
  onSearchChange: (value: string) => void;
  onStartsWithChange: (value: TableQueryState["startsWith"]) => void;
  onSortChange: (value: AcademicInstructorSort) => void;
  onLimitChange: (value: number) => void;
};

export function AcademicInstructorFilters({
  tableState,
  rowsPerPage,
  onSearchChange,
  onStartsWithChange,
  onSortChange,
  onLimitChange,
}: AcademicInstructorFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
      <label className="focus-ring flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2">
        <Search className="h-4 w-4 text-(--text-dim)" aria-hidden />
        <input
          type="search"
          value={tableState.searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by instructor name..."
          className="w-full bg-transparent text-sm outline-none"
          aria-label="Search instructor by name"
        />
      </label>

      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <SlidersHorizontal className="h-4 w-4 text-(--text-dim)" aria-hidden />
        <span className="text-(--text-dim)">Filter:</span>
        <select
          value={tableState.startsWith}
          onChange={(event) =>
            onStartsWithChange(event.target.value as TableQueryState["startsWith"])
          }
          className="rounded-md bg-(--surface) px-1.5 py-1 text-sm text-(--text) outline-none"
          aria-label="Filter by name range"
        >
          <option value="all" className="bg-(--surface) text-(--text)">
            All
          </option>
          <option value="a-m" className="bg-(--surface) text-(--text)">
            A-M
          </option>
          <option value="n-z" className="bg-(--surface) text-(--text)">
            N-Z
          </option>
        </select>
      </label>

      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Sort:</span>
        <select
          value={tableState.sort}
          onChange={(event) => onSortChange(event.target.value as AcademicInstructorSort)}
          className="rounded-md bg-(--surface) px-1.5 py-1 text-sm text-(--text) outline-none"
          aria-label="Sort by name"
        >
          {ACADEMIC_INSTRUCTOR_SORT_OPTIONS.map((sortValue) => (
            <option
              key={sortValue}
              value={sortValue}
              className="bg-(--surface) text-(--text)"
            >
              {sortValue === "name" ? "Name A-Z" : "Name Z-A"}
            </option>
          ))}
        </select>
      </label>

      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Rows:</span>
        <select
          value={tableState.limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="rounded-md bg-(--surface) px-1.5 py-1 text-sm text-(--text) outline-none"
          aria-label="Rows per page"
        >
          {rowsPerPage.map((size) => (
            <option key={size} value={size} className="bg-(--surface) text-(--text)">
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
