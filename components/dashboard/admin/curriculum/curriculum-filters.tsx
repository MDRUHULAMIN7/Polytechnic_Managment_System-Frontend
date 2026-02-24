"use client";

import type { CurriculumSort } from "@/lib/types/pages/curriculum/curriculum.types";

type CurriculumFiltersProps = {
  searchTerm: string;
  sort: CurriculumSort;
  limit: number;
  rowsPerPage: readonly number[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: CurriculumSort) => void;
  onLimitChange: (value: number) => void;
};

export function CurriculumFilters({
  searchTerm,
  sort,
  limit,
  rowsPerPage,
  onSearchChange,
  onSortChange,
  onLimitChange,
}: CurriculumFiltersProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Search:</span>
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by session..."
          className="w-full bg-transparent px-1.5 py-1 outline-none"
          aria-label="Search curriculums"
        />
      </label>

      <label className="focus-ring inline-flex items-center gap-2 rounded-xl border border-(--line) px-3 py-2 text-sm">
        <span className="text-(--text-dim)">Sort:</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as CurriculumSort)}
          className="w-full rounded-md bg-(--surface) px-1.5 py-1"
          aria-label="Sort curriculums"
        >
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="session">Session (A-Z)</option>
          <option value="-session">Session (Z-A)</option>
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
