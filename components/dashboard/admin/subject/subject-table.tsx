import Link from "next/link";
import type { SubjectTableProps } from "@/lib/type/dashboard/admin/subject/ui";

function renderCode(code: number) {
  if (!code) {
    return "--";
  }
  return String(code);
}

export function SubjectTable({
  items,
  loading,
  error,
  onEdit,
  onDelete,
  onAssign,
  basePath = "/dashboard/admin/subjects",
  showEdit = true,
  showAssign = true,
  showDelete = true,
  actionsLabel = "Actions",
}: SubjectTableProps) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Title</th>
              <th className="px-5 py-4 font-semibold">Code</th>
              <th className="px-5 py-4 font-semibold">Credits</th>
              <th className="px-5 py-4 font-semibold">Regulation</th>
              <th className="px-5 py-4 font-semibold text-right">{actionsLabel}</th>
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
                      <div className="h-4 w-20 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-20 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-28 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-(--text-dim)">
                  {error ? "Failed to load subjects." : "No subjects found."}
                </td>
              </tr>
            ) : null}

            {!loading &&
              items.map((item) => (
                <tr key={item._id} className="border-b border-(--line) last:border-b-0">
                  <td className="px-5 py-4">
                    <p className="font-medium">{item.title}</p>
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {renderCode(item.code)}
                  </td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.credits}</td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.regulation}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      <Link
                        href={`${basePath}/${item._id}`}
                        scroll={false}
                        className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                      >
                        View
                      </Link>
                      {showEdit && onEdit ? (
                        <button
                          type="button"
                          onClick={() => onEdit(item)}
                          className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                        >
                          Edit
                        </button>
                      ) : null}
                      {showAssign && onAssign ? (
                        <button
                          type="button"
                          onClick={() => onAssign(item)}
                          className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
                        >
                          Assign
                        </button>
                      ) : null}
                      {showDelete && onDelete ? (
                        <button
                          type="button"
                          onClick={() => onDelete(item)}
                          className="focus-ring inline-flex h-9 min-w-20 items-center justify-center rounded-lg border border-red-500/50 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      ) : null}
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
