import Link from "next/link";
import type { AcademicSemesterTableProps } from "@/lib/type/dashboard/admin/academic-semester/ui";

function formatDuration(start?: string, end?: string) {
  if (!start && !end) {
    return "--";
  }

  if (start && end) {
    return `${start} - ${end}`;
  }

  return start ?? end ?? "--";
}

export function AcademicSemesterTable({
  items,
  loading,
  error,
  onEdit,
}: AcademicSemesterTableProps) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface)">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-(--line) text-xs uppercase tracking-[0.16em] text-(--text-dim)">
            <tr>
              <th className="px-5 py-4 font-semibold">Name</th>
              <th className="px-5 py-4 font-semibold">Code</th>
              <th className="px-5 py-4 font-semibold">Year</th>
              <th className="px-5 py-4 font-semibold">Duration</th>
              <th className="px-5 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="border-b border-(--line)">
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-14 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 animate-pulse rounded bg-(--surface-muted)" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="ml-auto h-9 w-24 animate-pulse rounded-lg bg-(--surface-muted)" />
                    </td>
                  </tr>
                ))
              : null}

            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-(--text-dim)">
                  {error
                    ? "Failed to load academic semesters."
                    : "No academic semesters found."}
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
                  <td className="px-5 py-4 text-(--text-dim)">{item.code}</td>
                  <td className="px-5 py-4 text-(--text-dim)">{item.year}</td>
                  <td className="px-5 py-4 text-(--text-dim)">
                    {formatDuration(item.startMonth, item.endMonth)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {item._id ? (
                        <Link
                          href={`/dashboard/admin/academic-semesters/${item._id}`}
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
