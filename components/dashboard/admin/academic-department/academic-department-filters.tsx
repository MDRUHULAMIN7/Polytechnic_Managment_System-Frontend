import type { AcademicDepartmentFiltersProps } from "@/lib/type/dashboard/admin/academic-department/ui";

export function AcademicDepartmentFilters({
  search,
  sort,
  academicInstructor,
  instructors,
  onSearchChange,
  onSortChange,
  onInstructorChange,
}: AcademicDepartmentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Search
        </label>
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by department"
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
        />
      </div>

      <div className="w-full lg:max-w-xs">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Academic Instructor
        </label>
        <select
          value={academicInstructor}
          onChange={(event) => onInstructorChange(event.target.value)}
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
        >
          <option value="">All instructors</option>
          {instructors.map((instructor) => (
            <option key={instructor._id} value={instructor._id}>
              {instructor.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full lg:w-auto">
        <div className="min-w-42.5">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Sort
          </label>
          <select
            value={sort}
            onChange={(event) =>
              onSortChange(
                event.target.value as AcademicDepartmentFiltersProps["sort"]
              )
            }
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="name">Name A-Z</option>
            <option value="-name">Name Z-A</option>
          </select>
        </div>
      </div>
    </div>
  );
}
