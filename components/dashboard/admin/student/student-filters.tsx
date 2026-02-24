"use client";

import { Search } from "lucide-react";
import type { ServerListState } from "@/lib/list-query";
import type { StudentSort } from "@/lib/utils/student/student-utils";

type StudentFiltersProps = {
  tableState: ServerListState;
  rowsPerPage: readonly number[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: StudentSort) => void;
  onLimitChange: (value: number) => void;
};

export function StudentFilters({
  tableState,
  rowsPerPage,
  onSearchChange,
  onSortChange,
  onLimitChange,
}: StudentFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
      <label className="focus-ring flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2">
        <Search className="h-4 w-4 text-(--text-dim)" aria-hidden />
        <input
          type="search"
          value={tableState.searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by id, name, email..."
          className="w-full bg-transparent text-sm outline-none"
          aria-label="Search student"
        />
      </label>

      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Sort:</span>
        <select
          value={tableState.sort}
          onChange={(event) => onSortChange(event.target.value as StudentSort)}
          className="rounded-md bg-(--surface) px-1.5 py-1 text-sm text-(--text) outline-none"
        >
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
        </select>
      </label>

      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Rows:</span>
        <select
          value={tableState.limit}
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
