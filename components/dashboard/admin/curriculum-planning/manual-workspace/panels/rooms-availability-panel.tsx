"use client";

import { useMemo, useState } from "react";
import { useRoomAvailabilityData } from "@/hooks/dashboard/admin/room/use-room-availability";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import { formatRoomOptionLabel } from "@/utils/dashboard/admin/room/format-room-label";
import { Modal } from "@/components/dashboard/admin/room/modal";
import { RoomAvailabilityTable } from "@/components/dashboard/admin/room/room-availability-table";

function RoomDetailsModal({
  room,
  open,
  onClose,
  schedulablePeriods,
  draftBlocks,
  draftSubjectTitle,
  draftInstructorLabel,
  allowedPeriodNos,
}: {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  schedulablePeriods: PeriodConfigItem[];
  draftBlocks: ManualWorkspaceDraftBlock[];
  draftSubjectTitle: string;
  draftInstructorLabel: string;
  allowedPeriodNos: Set<number>;
}) {
  const {
    offeredSubjects,
    loading,
    error,
  } = useRoomAvailabilityData(Boolean(open && room?._id));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={room ? `${room.roomName} · Room Availability` : "Room Availability"}
      description="Weekly room status by day and period (Blocked vs Free)."
    >
      <RoomAvailabilityTable
        schedulablePeriods={schedulablePeriods}
        loading={loading}
        error={error}
        offeredSubjects={offeredSubjects}
        roomId={room?._id ?? ""}
        draftBlocks={draftBlocks}
        draftSubjectTitle={draftSubjectTitle}
        draftInstructorLabel={draftInstructorLabel}
        allowedPeriodNos={allowedPeriodNos}
      />
    </Modal>
  );
}

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
}) {
  /** User override; when null we follow the first room once the list loads (avoids stale ""). */
  const [pickedRoomId, setPickedRoomId] = useState<string | null>(null);

  const roomId = useMemo(() => {
    if (rooms.length === 0) return "";
    if (pickedRoomId && rooms.some((r) => r._id === pickedRoomId)) return pickedRoomId;
    return rooms[0]._id;
  }, [rooms, pickedRoomId]);

  const [detailsRoomId, setDetailsRoomId] = useState<string | null>(null);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room._id === detailsRoomId) ?? null,
    [rooms, detailsRoomId],
  );

  const {
    offeredSubjects: globalOfferedSubjects,
    loading: globalLoading,
    error: globalError,
  } = useRoomAvailabilityData(Boolean(roomId));

  const resolvedOfferings = useMemo(() => {
    // Merge global offerings with current semester offerings and draft blocks
    // RoomAvailabilityTable handles the filtering by roomId and merging draftBlocks internally
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
        <button
          type="button"
          onClick={() => setDetailsRoomId(roomId)}
          disabled={!roomId}
          className="focus-ring inline-flex h-11 items-center justify-center rounded-xl border border-(--line) bg-(--surface) px-4 text-sm font-semibold text-(--text) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-50"
        >
          View room details
        </button>
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
          draftSubjectTitle={draftSubjectTitle}
          draftInstructorLabel={draftInstructorLabel}
          allowedPeriodNos={allowedPeriodNos}
        />
      </div>
      <RoomDetailsModal
        room={selectedRoom}
        open={Boolean(detailsRoomId)}
        onClose={() => setDetailsRoomId(null)}
        schedulablePeriods={schedulablePeriods}
        draftBlocks={draftBlocks}
        draftSubjectTitle={draftSubjectTitle}
        draftInstructorLabel={draftInstructorLabel}
        allowedPeriodNos={allowedPeriodNos}
      />
    </div>
  );
}
