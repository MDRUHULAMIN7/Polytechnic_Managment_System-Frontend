import { Search, ListFilter, SortAsc } from "lucide-react";
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
    <div className="flex flex-col gap-4 rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-sm lg:flex-row lg:items-end">
      <div className="flex-1 sm:max-w-md">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--text-dim)">
          <Search className="h-3 w-3" />
          Search
        </label>
        <div className="relative mt-2">
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by subject or instructor..."
            className="focus-ring h-11 w-full rounded-xl border border-(--line) bg-(--surface) pl-3 pr-10 text-sm transition-all focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/20"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-4 w-4 text-(--text-dim)/40" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row lg:w-auto">
        {scope && onScopeChange ? (
          <div className="min-w-50">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--text-dim)">
              <ListFilter className="h-3 w-3" />
              Filter Scope
            </label>
            <select
              value={scope}
              onChange={(event) =>
                onScopeChange(event.target.value as OfferedSubjectScopeOption)
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) transition-all focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/20"
            >
              <option value="all">All Offered Subjects</option>
              <option value="my">My Offered Subjects</option>
            </select>
          </div>
        ) : null}

        <div className="min-w-50">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-(--text-dim)">
            <SortAsc className="h-3 w-3" />
            Sort Order
          </label>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(event.target.value as OfferedSubjectFiltersProps["sort"])
            }
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text) transition-all focus:border-(--accent) focus:ring-1 focus:ring-(--accent)/20"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
          </select>
        </div>
      </div>
    </div>
  );
}
