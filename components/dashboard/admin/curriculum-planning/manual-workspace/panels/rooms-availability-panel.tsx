"use client";

import { useMemo, useState } from "react";
import { useRoomAvailabilityData } from "@/hooks/dashboard/admin/room/use-room-availability";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import { formatRoomOptionLabel } from "@/utils/dashboard/admin/room/format-room-label";
import { RoomAvailabilityTable } from "@/components/dashboard/admin/room/room-availability-table";
import { ConflictsPanel } from "./conflicts-panel";
import type { SchedulePreviewConflict } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";

export function RoomsAvailabilityPanel({
  rooms,
  schedulablePeriods,
  offerings,
  offeringsLoading,
  offeringsError,
  draftBlocks,
  draftSubjectTitle,
  draftInstructorLabel,
  allowedPeriodNos,
  subjects,
  instructors,
  conflicts = [],
  conflictsLoading = false,
}: {
  rooms: Room[];
  schedulablePeriods: PeriodConfigItem[];
  offerings: OfferedSubject[];
  offeringsLoading: boolean;
  offeringsError: string | null;
  draftBlocks: ManualWorkspaceDraftBlock[];
  draftSubjectTitle: string;
  draftInstructorLabel: string;
  allowedPeriodNos: Set<number>;
  subjects: Subject[];
  instructors: Instructor[];
  conflicts?: SchedulePreviewConflict[];
  conflictsLoading?: boolean;
}) {
  /** User override; when null we follow the first room once the list loads (avoids stale ""). */
  const [pickedRoomId, setPickedRoomId] = useState<string | null>(null);

  const roomId = useMemo(() => {
    if (rooms.length === 0) return "";
    if (pickedRoomId && rooms.some((r) => r._id === pickedRoomId)) return pickedRoomId;
    return rooms[0]._id;
  }, [rooms, pickedRoomId]);

  const { offeredSubjects: globalOfferedSubjects, loading: globalLoading, error: globalError } = useRoomAvailabilityData(Boolean(roomId));

  const resolvedOfferings = useMemo(() => {
    return globalOfferedSubjects.length > 0 ? globalOfferedSubjects : offerings;
  }, [globalOfferedSubjects, offerings]);

  const lastBlockRoomLabel = useMemo(() => {
    const rid = draftBlocks[draftBlocks.length - 1]?.room;
    if (!rid) return null;
    const r = rooms.find((x) => x._id === rid);
    return r ? formatRoomOptionLabel(r) : null;
  }, [draftBlocks, rooms]);

  if (rooms.length === 0) {
    return <p className="text-sm text-(--text-dim)">No rooms loaded for this workspace.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select
            value={roomId}
            onChange={(e) => {
              setPickedRoomId(e.target.value);
            }}
            className="min-w-0 flex-1 rounded-lg border border-(--line) bg-(--surface-alt) px-2 py-1.5 text-xs"
          >
            {rooms.map((r) => (
              <option key={r._id} value={r._id}>
                {formatRoomOptionLabel(r)}
              </option>
            ))}
          </select>
        </div>
        {lastBlockRoomLabel ? (
          <p className="text-[10px] text-(--text-dim)">
            Last block used <span className="font-medium text-(--text)">{lastBlockRoomLabel}</span> — choose it in the
            list to see that room&apos;s week.
          </p>
        ) : null}
        <div className="max-h-[min(520px,72vh)] overflow-auto">
          <RoomAvailabilityTable
            schedulablePeriods={schedulablePeriods}
            loading={offeringsLoading || globalLoading}
            error={offeringsError || globalError}
            offeredSubjects={resolvedOfferings}
            roomId={roomId}
            draftBlocks={draftBlocks}
            subjects={subjects}
            instructors={instructors}
            draftSubjectTitle={draftSubjectTitle}
            draftInstructorLabel={draftInstructorLabel}
            allowedPeriodNos={allowedPeriodNos}
            showLegend={false}
          />
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-400/80">
            Room Conflicts
          </h4>
          <ConflictsPanel conflicts={conflicts} isLoading={conflictsLoading} />
        </div>
      )}
    </div>
  );
}
