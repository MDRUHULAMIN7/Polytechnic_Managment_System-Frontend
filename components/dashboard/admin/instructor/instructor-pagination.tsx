import type { InstructorPaginationProps } from "@/lib/type/dashboard/admin/instructor/ui";

export function InstructorPagination({
  meta,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: InstructorPaginationProps) {
  const totalPages = Math.max(meta.totalPage || 1, 1);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="text-(--text-dim)">
        Page <span className="font-semibold text-(--text)">{page}</span> of{" "}
        <span className="font-semibold text-(--text)">{totalPages}</span> -{" "}
        <span className="font-semibold text-(--text)">{meta.total}</span> total
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.16em] text-(--text-dim)">
          Rows
        </label>
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="focus-ring h-9 rounded-lg border border-(--line) bg-(--surface) px-2 text-sm text-(--text)"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <div className="ml-2 inline-flex items-center gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(page - 1)}
            className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Prev
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(page + 1)}
            className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-(--line) px-3 text-xs font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
