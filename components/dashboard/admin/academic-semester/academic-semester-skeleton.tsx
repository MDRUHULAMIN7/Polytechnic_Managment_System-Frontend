export function AcademicSemesterPageSkeleton() {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="h-3 w-32 rounded-full bg-(--surface-muted)" />
          <div className="h-7 w-60 rounded-full bg-(--surface-muted)" />
          <div className="h-4 w-72 rounded-full bg-(--surface-muted)" />
        </div>
        <div className="h-11 w-44 rounded-xl bg-(--surface-muted)" />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full lg:max-w-sm">
          <div className="h-3 w-20 rounded-full bg-(--surface-muted)" />
          <div className="mt-3 h-11 w-full rounded-xl bg-(--surface-muted)" />
        </div>
        <div className="w-full lg:max-w-xs">
          <div className="h-3 w-28 rounded-full bg-(--surface-muted)" />
          <div className="mt-3 h-11 w-full rounded-xl bg-(--surface-muted)" />
        </div>
        <div className="w-full lg:w-auto">
          <div className="h-3 w-16 rounded-full bg-(--surface-muted)" />
          <div className="mt-3 h-11 w-40 rounded-xl bg-(--surface-muted)" />
        </div>
      </div>

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
              {Array.from({ length: 6 }).map((_, index) => (
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
                    <div className="ml-auto h-9 w-28 animate-pulse rounded-lg bg-(--surface-muted)" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--line) bg-(--surface) px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="h-4 w-48 rounded-full bg-(--surface-muted)" />
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-3 w-10 rounded-full bg-(--surface-muted)" />
          <div className="h-9 w-20 rounded-lg bg-(--surface-muted)" />
          <div className="h-9 w-24 rounded-lg bg-(--surface-muted)" />
          <div className="h-9 w-24 rounded-lg bg-(--surface-muted)" />
        </div>
      </div>
    </section>
  );
}
