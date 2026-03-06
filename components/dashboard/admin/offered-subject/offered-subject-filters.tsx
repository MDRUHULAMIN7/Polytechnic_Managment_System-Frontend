import type { OfferedSubjectFiltersProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import type { OfferedSubjectScopeOption } from "@/lib/type/dashboard/admin/offered-subject";

export function OfferedSubjectFilters({
  search,
  sort,
  scope,
  onSearchChange,
  onSortChange,
  onScopeChange,
}: OfferedSubjectFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full sm:max-w-sm">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Search
        </label>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by subject or instructor"
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        />
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto">
        {scope && onScopeChange ? (
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Filter
            </label>
            <select
              value={scope}
              onChange={(event) =>
                onScopeChange(event.target.value as OfferedSubjectScopeOption)
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              <option value="all">All Offered Subjects</option>
              <option value="my">My Offered Subjects</option>
            </select>
          </div>
        ) : null}

        <div className="min-w-44">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Sort
          </label>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as OfferedSubjectFiltersProps["sort"])
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
