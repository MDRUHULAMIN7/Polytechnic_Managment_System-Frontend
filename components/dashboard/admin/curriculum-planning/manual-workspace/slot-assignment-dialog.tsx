"use client";

import { useMemo, useState } from "react";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { OfferedSubject, OfferedSubjectClassType, OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";
import { OFFERED_SUBJECT_CLASS_TYPES } from "@/lib/type/dashboard/admin/offered-subject/constants";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { Room } from "@/lib/type/dashboard/admin/room";
import {
  isRoomEligibleForClassType,
  isRoomFreeForDayPeriods,
  normalizeOfferedSubjectDay,
} from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";
import { expandBlockPeriods } from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";
import { resolveMaxContiguousFromStart } from "@/utils/dashboard/admin/manual-curriculum-workspace/period-contiguity";
import {
  mergeRoomOccupancyWithDraft,
  roomDayPeriodKey,
} from "@/utils/dashboard/admin/manual-curriculum-workspace/occupancy";
import { blocksShareSlot } from "@/utils/dashboard/admin/manual-curriculum-workspace/draft-routine";
import { formatRoomOptionLabel } from "@/utils/dashboard/admin/room/format-room-label";
import { showToast } from "@/utils/common/toast";

type SlotAssignmentFormProps = {
  day: OfferedSubjectDay;
  startPeriod: number;
  schedulablePeriods: PeriodConfigItem[];
  maxCapacity: number;
  rooms: Room[];
  semesterRoomSlots: Set<string>;
  draftBlocks: ManualWorkspaceDraftBlock[];
  instructorWeekOfferings: OfferedSubject[];
  editingBlock: ManualWorkspaceDraftBlock | null;
  allowedPeriodNos: Set<number>;
  roomId: string; // Passed from toolbar
  onClose: () => void;
  onSave: (block: Omit<ManualWorkspaceDraftBlock, "id">) => void;
};

function SlotAssignmentForm({
  day: rawDay,
  startPeriod,
  schedulablePeriods,
  maxCapacity,
  rooms,
  semesterRoomSlots,
  draftBlocks,
  instructorWeekOfferings,
  editingBlock,
  allowedPeriodNos,
  roomId,
  onClose,
  onSave,
}: SlotAssignmentFormProps) {
  const day = useMemo(() => normalizeOfferedSubjectDay(rawDay) || (rawDay as string), [rawDay]);

  const [classType, setClassType] = useState<OfferedSubjectClassType>(
    editingBlock?.classType ?? "theory",
  );
  const [periodCount, setPeriodCount] = useState(editingBlock?.periodCount ?? 1);

  const selectedRoom = useMemo(() => rooms.find((r) => r._id === roomId), [rooms, roomId]);

  const maxContiguous = useMemo(() => {
    return resolveMaxContiguousFromStart(schedulablePeriods, startPeriod);
  }, [schedulablePeriods, startPeriod]);

  const periodNumbers = useMemo(() => {
    return expandBlockPeriods({
      startPeriod,
      periodCount,
    });
  }, [startPeriod, periodCount]);

  const mergedSlots = useMemo(
    () =>
      mergeRoomOccupancyWithDraft(
        semesterRoomSlots,
        draftBlocks.filter((b) => !editingBlock || b.id !== editingBlock.id),
        allowedPeriodNos,
      ),
    [semesterRoomSlots, draftBlocks, editingBlock, allowedPeriodNos],
  );

  const eligibleRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (r.capacity < maxCapacity) return false;
      if (!isRoomEligibleForClassType(r, classType)) return false;
      if (periodNumbers.length === 0) return true;
      return isRoomFreeForDayPeriods(r._id, day, periodNumbers, mergedSlots);
    });
  }, [rooms, maxCapacity, classType, day, periodNumbers, mergedSlots]);

  const isCurrentRoomEligible = useMemo(() => {
    if (!roomId) return false;
    return eligibleRooms.some((r) => r._id === roomId);
  }, [eligibleRooms, roomId]);

  const instructorConflict = useMemo(() => {
    if (!day) return null;
    const candidate = { day: day as OfferedSubjectDay, startPeriod, periodCount };

    // 1. Check against current draft blocks (instructor overlap)
    const draftOverlap = draftBlocks.some(
      (b) =>
        (!editingBlock || b.id !== editingBlock.id) &&
        blocksShareSlot(candidate, b),
    );
    if (draftOverlap) return "Instructor already has a block in the current draft during these periods.";

    // 2. Check against existing semester offerings
    for (const offering of instructorWeekOfferings) {
      if (!offering.scheduleBlocks) continue;
      for (const block of offering.scheduleBlocks) {
        const blockNormalizedDay = normalizeOfferedSubjectDay(block.day);
        if (blockNormalizedDay !== day) continue;

        const blockPeriods = expandBlockPeriods(block);
        const hasOverlap = periodNumbers.some((p) => blockPeriods.includes(p));

        if (hasOverlap) {
          return `Instructor is busy teaching "${
            typeof offering.subject === "string" ? "another subject" : offering.subject.title
          }" during these periods.`;
        }
      }
    }

    return null;
  }, [day, startPeriod, periodCount, periodNumbers, draftBlocks, editingBlock, instructorWeekOfferings]);

  const roomConflict = useMemo(() => {
    if (!roomId || !day) return null;
    const candidate = { day: day as OfferedSubjectDay, startPeriod, periodCount, room: roomId };

    // 1. Check against current draft blocks (room overlap)
    const draftOverlap = draftBlocks.some(
      (b) =>
        (!editingBlock || b.id !== editingBlock.id) &&
        b.room === roomId &&
        blocksShareSlot(candidate, b),
    );
    if (draftOverlap) return "This room is already occupied by another block in your current draft.";

    // 2. Check against existing semester offerings (occupancy set)
    for (let p = startPeriod; p < startPeriod + periodCount; p += 1) {
      if (mergedSlots.has(roomDayPeriodKey(roomId, day, p))) {
        return "This room is already occupied by an existing offered subject in this semester.";
      }
    }

    return null;
  }, [day, startPeriod, periodCount, roomId, draftBlocks, editingBlock, mergedSlots]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Explicitly re-check conflicts to be 100% sure
    if (!roomId || roomConflict || instructorConflict || !isCurrentRoomEligible) {
      if (roomConflict) {
        showToast({ variant: "error", title: "Room Conflict", description: roomConflict });
      } else if (instructorConflict) {
        showToast({ variant: "error", title: "Instructor Conflict", description: instructorConflict });
      } else if (!roomId) {
        showToast({ variant: "error", title: "Room Required", description: "Please select a room in the toolbar." });
      } else {
        showToast({
          variant: "error",
          title: "Invalid Slot",
          description: "The selected room is not eligible for this class type or period count.",
        });
      }
      return;
    }

    const normalizedDay = normalizeOfferedSubjectDay(day) || day;

    onSave({
      classType,
      day: normalizedDay as OfferedSubjectDay,
      room: roomId,
      startPeriod,
      periodCount,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-(--line) bg-(--surface) p-5 shadow-2xl">
        <h3 className="text-lg font-semibold text-(--text)">Assign slot</h3>
        <p className="mt-1 text-xs text-(--text-dim)">
          {day} · Period {startPeriod}
          {editingBlock ? " · editing block" : ""}
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-(--text-dim)">Class type</label>
            <select
              value={classType}
              onChange={(ev) => setClassType(ev.target.value as OfferedSubjectClassType)}
              className="mt-1 w-full rounded-lg border border-(--line) bg-(--surface-alt) px-3 py-2 text-sm"
            >
              {OFFERED_SUBJECT_CLASS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-(--text-dim)">Period count</label>
            <select
              value={periodCount}
              onChange={(ev) => setPeriodCount(Number(ev.target.value))}
              className="mt-1 w-full rounded-lg border border-(--line) bg-(--surface-alt) px-3 py-2 text-sm"
            >
              {Array.from({ length: maxContiguous }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-(--text-dim)">Room</label>
            <div className="mt-1 flex h-10 items-center rounded-lg border border-(--line) bg-(--surface-muted) px-3 text-sm font-medium">
              {selectedRoom ? formatRoomOptionLabel(selectedRoom) : "No room selected"}
            </div>
            {!roomId ? (
              <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-300">
                Select a room from the toolbar to apply room-busy blocking and enable adding this slot.
              </p>
            ) : null}
            {!isCurrentRoomEligible && roomId ? (
              <p className="mt-1 text-xs text-amber-300">
                This room is not eligible for the current selection.
              </p>
            ) : null}
            {roomId ? (
              <div className="mt-3 rounded-lg border border-(--line) bg-(--surface-muted)/30 p-3">
                <p className="text-[11px] font-semibold text-(--text-dim)">
                  This room on {day} (live — semester + draft)
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {schedulablePeriods.map((p) => {
                    const busy = mergedSlots.has(roomDayPeriodKey(roomId, day, p.periodNo));
                    const inPick = periodNumbers.includes(p.periodNo);
                    return (
                      <div
                        key={p.periodNo}
                        title={`${p.startTime}–${p.endTime}${busy ? " · busy" : " · free"}`}
                        className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${
                          inPick
                            ? "border-(--accent) bg-(--accent)/20 text-(--text)"
                            : busy
                              ? "border-red-500/35 bg-red-500/15 text-red-100"
                              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
                        }`}
                      >
                        P{p.periodNo}
                        {busy ? " B" : " F"}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-[10px] text-(--text-dim)">
                  F = free, B = busy elsewhere. Highlighted periods are your current span.
                </p>
              </div>
            ) : null}
            {roomConflict ? (
              <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-300">
                {roomConflict}
              </p>
            ) : null}
            {instructorConflict ? (
              <p className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300">
                {instructorConflict}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-(--line) px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!roomId || Boolean(roomConflict) || Boolean(instructorConflict) || eligibleRooms.length === 0}
              className="rounded-lg bg-(--accent) px-4 py-2 text-sm font-semibold text-(--accent-ink) disabled:opacity-50"
            >
              {editingBlock ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SlotAssignmentDialog({
  open,
  day,
  startPeriod,
  schedulablePeriods,
  maxCapacity,
  rooms,
  semesterRoomSlots,
  draftBlocks,
  instructorWeekOfferings,
  editingBlock,
  allowedPeriodNos,
  roomId,
  onClose,
  onSave,
}: {
  open: boolean;
  day: OfferedSubjectDay | null;
  startPeriod: number | null;
  schedulablePeriods: PeriodConfigItem[];
  maxCapacity: number;
  rooms: Room[];
  semesterRoomSlots: Set<string>;
  draftBlocks: ManualWorkspaceDraftBlock[];
  instructorWeekOfferings: OfferedSubject[];
  editingBlock: ManualWorkspaceDraftBlock | null;
  allowedPeriodNos: Set<number>;
  roomId: string;
  onClose: () => void;
  onSave: (block: Omit<ManualWorkspaceDraftBlock, "id">) => void;
}) {
  if (!open || !day || !startPeriod) return null;

  return (
    <SlotAssignmentForm
      key={`${day}-${startPeriod}-${editingBlock?.id ?? "new"}`}
      day={day}
      startPeriod={startPeriod}
      schedulablePeriods={schedulablePeriods}
      maxCapacity={maxCapacity}
      rooms={rooms}
      semesterRoomSlots={semesterRoomSlots}
      draftBlocks={draftBlocks}
      instructorWeekOfferings={instructorWeekOfferings}
      editingBlock={editingBlock}
      allowedPeriodNos={allowedPeriodNos}
      roomId={roomId}
      onClose={onClose}
      onSave={onSave}
    />
  );
}
