import Link from "next/link";
import type { AcademicDepartmentTableProps } from "@/lib/type/dashboard/admin/academic-department/ui";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";

function resolveInstructorName(department: AcademicDepartment) {
  if (!department.academicInstructor) {
    return "—";
  }

  if (typeof department.academicInstructor === "string") {
    return department.academicInstructor;
  }

  return department.academicInstructor.name ?? "—";
}

export function AcademicDepartmentTable({
  items,
  loading,
  error,
  onEdit,
}: AcademicDepartmentTableProps) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Department</th>
              <th className="px-5 py-4 font-semibold">Instructor</th>
              <th className="px-5 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-(--line)">
                    <td className="px-5 py-4">
                      <div className="h-4 w-40 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-36 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-24 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-(--text-dim)">
                  {error
                    ? "Failed to load academic departments."
                    : "No academic departments found."}
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => (
                <tr
                  key={item._id}
                  className="border-b border-(--line) last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium">{item.name}</td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {resolveInstructorName(item)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {item._id ? (
                        <Link
                          href={`/dashboard/admin/academic-departments/${item._id}`}
                          scroll={false}
                          className="focus-ring inline-flex h-9 min-w-23 items-center justify-center rounded-lg border border-(--line) px-4 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="inline-flex h-9 min-w-23 items-center justify-center rounded-lg border border-(--line) px-4 text-xs font-semibold text-(--text-dim) opacity-60">
                          View
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        className="focus-ring inline-flex h-9 min-w-23 items-center justify-center rounded-lg bg-(--accent) px-4 text-xs font-semibold text-(--accent-ink) transition hover:opacity-90"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
