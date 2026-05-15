"use client";

import { useMemo } from "react";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";
import { X } from "lucide-react";
import {
  normalizeOfferedSubjectDay,
  roomDayPeriodKey,
} from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";

export function RoutineCell({
  day,
  periodNo,
  covering,
  conflictingBlockIds,
  onEmptyClick,
  onRemoveBlock,
  roomId,
  instructorId,
  roomOccupancySlots,
  instructorWeekOccupancy,
  roomConflictReady,
}: {
  day: OfferedSubjectDay;
  periodNo: number;
  covering: ManualWorkspaceDraftBlock[];
  conflictingBlockIds: Set<string>;
  onEmptyClick: (day: OfferedSubjectDay, periodNo: number) => void;
  onRemoveBlock: (id: string) => void;
  roomId: string;
  instructorId: string;
  roomOccupancySlots: Set<string>;
  instructorWeekOccupancy: Set<string>;
  roomConflictReady: boolean;
}) {
  const isBusy = useMemo(() => {
    if (!roomId && !instructorId) return false;
    const normalizedDay = normalizeOfferedSubjectDay(day) || day;

    const roomBusy =
      Boolean(roomId) && roomOccupancySlots.has(roomDayPeriodKey(roomId, normalizedDay, periodNo));
    const instructorBusy =
      Boolean(instructorId) &&
      instructorWeekOccupancy.has(`${instructorId}:${normalizedDay}:${periodNo}`);

    return Boolean(roomBusy || instructorBusy);
  }, [day, periodNo, roomId, instructorId, roomOccupancySlots, instructorWeekOccupancy]);

  if (covering.length === 0) {
    const roomBusyCheckPending = Boolean(roomId) && !roomConflictReady;
    const disabled = !instructorId || isBusy || roomBusyCheckPending;
    const buttonLabel = isBusy
      ? "Busy"
      : roomBusyCheckPending
        ? "Checking room"
      : !instructorId
        ? "Pick instructor"
        : "+";

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEmptyClick(day, periodNo)}
        className={`flex min-h-[44px] w-full items-center justify-center rounded-lg border transition ${
          isBusy
            ? "cursor-not-allowed border-red-500/30 bg-red-500/10 text-red-300/50"
            : roomBusyCheckPending
              ? "cursor-not-allowed border-dashed border-sky-500/30 bg-sky-500/10 text-sky-200/70"
            : disabled
              ? "cursor-not-allowed border-dashed border-(--line) bg-(--surface-alt)/20 text-(--text-dim)/30"
              : !roomId
                ? "border-dashed border-amber-500/30 bg-amber-500/10 text-amber-200 hover:border-amber-400 hover:bg-amber-500/15"
                : "border-dashed border-(--line) bg-(--surface-alt)/40 text-(--text-dim) hover:border-(--accent) hover:bg-(--surface-muted)"
        }`}
      >
        {buttonLabel}
      </button>
    );
  }

  if (covering.length > 1) {
    return (
      <div className="min-h-[44px] rounded-lg border border-amber-500/40 bg-amber-500/10 p-1 text-[10px] text-amber-200">
        Overlap
      </div>
    );
  }

  const b = covering[0];
  const isStart = b.startPeriod === periodNo;
  const hasConflict = conflictingBlockIds.has(b.id);

  if (!isStart) {
    return (
      <div
        className={`min-h-[36px] rounded-sm ${
          hasConflict ? "bg-red-500/15" : "bg-(--accent)/10"
        }`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`relative flex min-h-[44px] flex-col justify-center rounded-lg border px-1 py-1 text-[10px] leading-tight ${
        hasConflict
          ? "border-red-500/50 bg-red-500/10 text-red-100"
          : "border-(--line) bg-(--surface-muted) text-(--text)"
      }`}
    >
      <span className="font-semibold uppercase">{b.classType}</span>
      <span className="truncate opacity-80">Rm {b.room.slice(-6)}</span>
      <button
        type="button"
        title="Remove block"
        onClick={(e) => {
          e.stopPropagation();
          onRemoveBlock(b.id);
        }}
        className="absolute right-0.5 top-0.5 rounded p-0.5 text-(--text-dim) hover:bg-(--surface) hover:text-red-300"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
