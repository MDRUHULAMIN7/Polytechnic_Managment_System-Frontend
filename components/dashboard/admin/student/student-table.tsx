import Link from "next/link";
import type { StudentTableProps } from "@/lib/type/dashboard/admin/student/ui";
import type { StudentStatus } from "@/lib/type/dashboard/admin/student";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";

function resolveName(name?: { firstName?: string; middleName?: string; lastName?: string }) {
  if (!name) {
    return "--";
  }

  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ");
}

function resolveDepartmentName(value?: AcademicDepartment | string) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name ?? "--";
}

function resolveSemesterLabel(value?: AcademicSemester | string) {
  if (!value) {
    return "--";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.code ? `${value.name} (${value.code})` : value.name ?? "--";
}

const statusOptions: StudentStatus[] = ["active", "blocked"];

export function StudentTable({
  items,
  loading,
  error,
  statusUpdatingId,
  canChangeStatus,
  onStatusChange,
}: StudentTableProps) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Student</th>
              <th className="px-5 py-4 font-semibold">ID</th>
              <th className="px-5 py-4 font-semibold">Department</th>
              <th className="px-5 py-4 font-semibold">Semester</th>
              <th className="px-5 py-4 font-semibold">Status</th>
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
                      <div className="h-4 w-20 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-24 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-(--text-dim)">
                  {error ? "Failed to load students." : "No students found."}
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => {
                const currentStatus = item.user?.status ?? "active";
                const userId = item.user?._id;
                const statusDisabled = !userId || statusUpdatingId === userId || !canChangeStatus;

                return (
                  <tr key={item.id} className="border-b border-(--line) last:border-b-0">
                    <td className="px-5 py-4">
                      <p className="font-medium">{resolveName(item.name)}</p>
                      <p className="mt-1 text-xs text-(--text-dim)">{item.email}</p>
                    </td>
                    <td className="px-5 py-4 text-(--text-dim)">{item.id}</td>
                    <td className="px-5 py-4 text-(--text-dim)">
                      {resolveDepartmentName(item.academicDepartment)}
                    </td>
                    <td className="px-5 py-4 text-(--text-dim)">
                      {resolveSemesterLabel(item.admissionSemester)}
                    </td>
                    <td className="px-5 py-4">
                      {userId && canChangeStatus ? (
                        <select
                          value={currentStatus}
                          onChange={(event) =>
                            onStatusChange(item, event.target.value as StudentStatus)
                          }
                          disabled={statusDisabled}
                          className="focus-ring h-9 rounded-lg border border-(--line) bg-(--surface) px-2 text-xs font-semibold text-(--text) capitalize disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : userId ? (
                        <span className="text-xs font-semibold capitalize text-(--text)">
                          {currentStatus}
                        </span>
                      ) : (
                        <span className="text-xs text-(--text-dim)">Unavailable</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {item.id ? (
                          <Link
                            href={`/dashboard/admin/students/${item.id}`}
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
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
