"use client";

import { Fragment } from "react";
import type {
  ManualWorkspaceDraftBlock,
  SchedulePreviewConflict,
} from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";
import { OFFERED_SUBJECT_DAYS } from "@/lib/type/dashboard/admin/offered-subject/constants";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import {
  type OccupancyInfo,
} from "@/utils/dashboard/admin/manual-curriculum-workspace/occupancy";
import { findBlocksCoveringCell } from "@/utils/dashboard/admin/manual-curriculum-workspace/draft-routine";
import { RoutineCell } from "./routine-cell";

export function RoutineGrid({
  schedulablePeriods,
  draftBlocks,
  onEmptyCell,
  onRemoveBlock,
  roomId,
  instructorId,
  roomOccupancyMap,
  instructorWeekOccupancyMap,
  roomConflictReady,
  lockMessage,
  subjectTitle,
  instructorLabel,
  rooms,
  subjects,
  instructors,
  conflictingBlockIds,
}: {
  schedulablePeriods: PeriodConfigItem[];
  draftBlocks: ManualWorkspaceDraftBlock[];
  conflicts: SchedulePreviewConflict[];
  onEmptyCell: (day: OfferedSubjectDay, periodNo: number) => void;
  onRemoveBlock: (id: string) => void;
  roomId: string;
  instructorId: string;
  roomOccupancyMap: Map<string, OccupancyInfo>;
  instructorWeekOccupancyMap: Map<string, OccupancyInfo>;
  roomConflictReady: boolean;
  lockMessage?: string | null;
  subjectTitle: string;
  instructorLabel: string;
  rooms: Room[];
  subjects: Subject[];
  instructors: Instructor[];
  conflictingBlockIds: Set<string>;
}) {
  const days = OFFERED_SUBJECT_DAYS;

  return (
    <div className="overflow-x-auto rounded-2xl border border-(--line) bg-(--surface) p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--line) bg-(--surface-muted)/30 px-3 py-2 text-[11px]">
        <div className="text-(--text-dim)">
          {instructorLabel
            ? `Filtering by ${instructorLabel}. Instructor-busy slots are blocked.`
            : "Select an instructor to filter busy periods."}
          {roomId ? " Room-busy blocking is also active." : ""}
        </div>
        {lockMessage ? (
          <div className="font-medium text-amber-300">{lockMessage}</div>
        ) : (
          <div className="font-medium text-emerald-300">
            Ready to add {subjectTitle || "block"} only where conflict-free.
          </div>
        )}
      </div>

      <div
        className="grid gap-px bg-(--line)"
        style={{
          gridTemplateColumns: `88px repeat(${schedulablePeriods.length}, minmax(52px, 1fr))`,
        }}
      >
        <div className="bg-(--surface-muted) p-2 text-[10px] font-semibold text-(--text-dim)">
          Day / Period
        </div>
        {schedulablePeriods.map((p) => (
          <div
            key={p.periodNo}
            className="bg-(--surface-muted) p-1 text-center text-[10px] font-semibold text-(--text-dim)"
          >
            <div>P{p.periodNo}</div>
            <div className="text-[9px] font-normal opacity-70">
              {p.startTime}-{p.endTime}
            </div>
          </div>
        ))}

        {days.map((day) => (
          <Fragment key={day}>
            <div className="flex items-center bg-(--surface-alt) px-2 text-xs font-semibold text-(--text-dim)">
              {day}
            </div>
            {schedulablePeriods.map((p) => {
              const covering = findBlocksCoveringCell(draftBlocks, day, p.periodNo);
              return (
                <div key={`${day}-${p.periodNo}`} className="bg-(--surface) p-0.5">
                  <RoutineCell
                    day={day}
                    periodNo={p.periodNo}
                    covering={covering}
                    conflictingBlockIds={conflictingBlockIds}
                    onEmptyClick={onEmptyCell}
                    onRemoveBlock={onRemoveBlock}
                    roomId={roomId}
                    instructorId={instructorId}
                    roomOccupancyMap={roomOccupancyMap}
                    instructorWeekOccupancyMap={instructorWeekOccupancyMap}
                    roomConflictReady={roomConflictReady}
                    rooms={rooms}
                    subjects={subjects}
                    instructors={instructors}
                  />
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
