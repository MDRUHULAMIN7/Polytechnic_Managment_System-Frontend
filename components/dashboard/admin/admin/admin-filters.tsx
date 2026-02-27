import type { AdminFiltersProps } from "@/lib/type/dashboard/admin/admin/ui";

export function AdminFilters({
  search,
  sort,
  onSearchChange,
  onSortChange,
}: AdminFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="w-full sm:max-w-sm">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Search
        </label>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or email"
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        />
      </div>

      <div className="w-full sm:w-auto">
        <div className="min-w-44">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Sort
          </label>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as AdminFiltersProps["sort"])
            }
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
          </select>
        </div>
      </div>
    </div>
  );
}
