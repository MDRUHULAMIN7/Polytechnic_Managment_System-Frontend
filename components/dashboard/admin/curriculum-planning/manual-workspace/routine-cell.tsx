"use client";

import { useMemo } from "react";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";
import { X } from "lucide-react";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import { formatRoomOptionLabel } from "@/utils/dashboard/admin/room/format-room-label";
import {
  normalizeOfferedSubjectDay,
  roomDayPeriodKey,
  type OccupancyInfo,
} from "@/utils/dashboard/admin/manual-curriculum-workspace/occupancy";

export function RoutineCell({
  day,
  periodNo,
  covering,
  conflictingBlockIds,
  onEmptyClick,
  onRemoveBlock,
  roomId,
  instructorId,
  roomOccupancyMap,
  instructorWeekOccupancyMap,
  roomConflictReady,
  rooms,
  subjects,
  instructors,
}: {
  day: OfferedSubjectDay;
  periodNo: number;
  covering: ManualWorkspaceDraftBlock[];
  conflictingBlockIds: Set<string>;
  onEmptyClick: (day: OfferedSubjectDay, periodNo: number) => void;
  onRemoveBlock: (id: string) => void;
  roomId: string;
  instructorId: string;
  roomOccupancyMap: Map<string, OccupancyInfo>;
  instructorWeekOccupancyMap: Map<string, OccupancyInfo>;
  roomConflictReady: boolean;
  rooms: Room[];
  subjects: Subject[];
  instructors: Instructor[];
}) {
  const busyInfo = useMemo(() => {
    if (!roomId && !instructorId) return null;
    const normalizedDay = normalizeOfferedSubjectDay(day) || day;

    const roomOccupancy =
      Boolean(roomId) && roomOccupancyMap.get(roomDayPeriodKey(roomId, normalizedDay, periodNo));
    const instructorOccupancy =
      Boolean(instructorId) &&
      instructorWeekOccupancyMap.get(`${instructorId}:${normalizedDay}:${periodNo}`);

    return roomOccupancy || instructorOccupancy || null;
  }, [day, periodNo, roomId, instructorId, roomOccupancyMap, instructorWeekOccupancyMap]);

  const isBusy = Boolean(busyInfo);

  if (covering.length === 0) {
    const roomBusyCheckPending = Boolean(roomId) && !roomConflictReady;
    const disabled = !instructorId || isBusy || roomBusyCheckPending;
    
    let buttonLabel: React.ReactNode = "+";
    if (isBusy) {
      const title = busyInfo?.subjectTitle;
      if (title) {
        buttonLabel = (
          <div className="flex flex-col items-center justify-center gap-0.5 leading-none">
            <span className="truncate max-w-12.5 font-bold text-[9px]">{title}</span>
            <span className="text-[8px] opacity-70">Busy</span>
          </div>
        );
      } else {
        buttonLabel = "Busy";
      }
    } else if (roomBusyCheckPending) {
      buttonLabel = "Checking room";
    } else if (!instructorId) {
      buttonLabel = "Pick instructor";
    }

    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => onEmptyClick(day, periodNo)}
        className={`flex min-h-11 w-full items-center justify-center rounded-lg border transition ${
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
      <div className="min-h-11 rounded-lg border border-amber-500/40 bg-amber-500/10 p-1 text-[10px] text-amber-200">
        Overlap
      </div>
    );
  }

  const b = covering[0];
  const isStart = b.startPeriod === periodNo;
  const hasConflict = conflictingBlockIds.has(b.id);
  const room = rooms.find((r) => r._id === b.room);
  const roomLabel = room ? formatRoomOptionLabel(room) : `Room ${b.room}`;

  if (!isStart) {
    return (
      <div
        className={`min-h-9 rounded-sm ${
          hasConflict ? "bg-red-500/15" : "bg-(--accent)/10"
        }`}
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`relative flex min-h-11 flex-col justify-center rounded-lg border px-2 py-1 text-[10px] leading-tight ${
        hasConflict
          ? "border-red-500/50 bg-red-500/10 text-red-100"
          : "border-(--line) bg-(--surface-muted) text-(--text)"
      }`}
    >
      <span className="font-semibold uppercase">{b.classType}</span>
      {(() => {
        const subject = subjects.find((s) => s._id === b.subjectId);
        return subject ? <span className="truncate text-[9px] opacity-90">{subject.title}</span> : null;
      })()}
      {(() => {
        const instructor = instructors.find((i) => i._id === b.instructorId);
        return instructor ? (
          <span className="truncate text-[9px] opacity-80">
            {[instructor.name.firstName, instructor.name.lastName].filter(Boolean).join(" ")}
          </span>
        ) : null;
      })()}
      <span className="truncate text-[9px] opacity-70">{roomLabel}</span>
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
