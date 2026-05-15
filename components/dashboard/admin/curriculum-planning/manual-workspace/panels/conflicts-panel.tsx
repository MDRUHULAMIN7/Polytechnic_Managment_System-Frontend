"use client";

import type { SchedulePreviewConflict } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";

export function ConflictsPanel({
  conflicts,
  isLoading,
}: {
  conflicts: SchedulePreviewConflict[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return <p className="text-xs text-(--text-dim)">Checking with server…</p>;
  }
  if (!conflicts.length) {
    return (
      <p className="text-xs text-emerald-300/90">
        No conflicts from preview API for the current draft.
      </p>
    );
  }
  return (
    <ul className="max-h-[220px] space-y-2 overflow-y-auto text-xs">
      {conflicts.map((c, i) => (
        <li
          key={`${c.blockIndex}-${i}`}
          className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-2 text-red-100"
        >
          <span className="font-semibold uppercase text-[10px] text-red-200/90">{c.type}</span>
          <p className="mt-1 leading-snug">{c.message}</p>
        </li>
      ))}
    </ul>
  );
}
