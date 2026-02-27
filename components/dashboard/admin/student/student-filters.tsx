import type { StudentFiltersProps } from "@/lib/type/dashboard/admin/student/ui";

export function StudentFilters({
  search,
  sort,
  academicDepartment,
  admissionSemester,
  departments,
  semesters,
  onSearchChange,
  onSortChange,
  onDepartmentChange,
  onSemesterChange,
}: StudentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full lg:max-w-sm">
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

      <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Department
          </label>
          <select
            value={academicDepartment}
            onChange={(event) => onDepartmentChange(event.target.value)}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="">All departments</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Semester
          </label>
          <select
            value={admissionSemester}
            onChange={(event) => onSemesterChange(event.target.value)}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="">All semesters</option>
            {semesters.map((semester) => (
              <option key={semester._id} value={semester._id}>
                {semester.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Sort
          </label>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as StudentFiltersProps["sort"])}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="-createdAt">Newest first</option>
            <option value="createdAt">Oldest first</option>
            <option value="name.firstName">Name A-Z</option>
            <option value="-name.firstName">Name Z-A</option>
            <option value="email">Email A-Z</option>
            <option value="-email">Email Z-A</option>
          </select>
        </div>
      </div>
    </div>
  );
}
