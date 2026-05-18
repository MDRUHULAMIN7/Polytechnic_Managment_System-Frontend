"use client";

import { Trash2, Plus, AlertCircle, Clock, MapPin, Layers } from "lucide-react";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { OfferedSubjectEditableScheduleBlock } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { OFFERED_SUBJECT_CLASS_TYPES, OFFERED_SUBJECT_DAYS } from "@/lib/type/dashboard/admin/offered-subject/constants";

interface ScheduleBlocksSectionProps {
  blocks: OfferedSubjectEditableScheduleBlock[];
  addBlock: () => void;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, field: keyof OfferedSubjectEditableScheduleBlock, value: string) => void;
  rooms: Room[];
  roomsById: Map<string, Room>;
  schedulablePeriods: PeriodConfigItem[];
  maxCapacity: number;
  isRoomEligibleForClassType: (room: Room, classType: string) => boolean;
  isRoomFreeForDayPeriods: (roomId: string, day: string, periodNos: number[], occupiedSlots: any) => boolean;
  mergeOccupancyWithSiblingBlocks: (occupiedSlots: any, blocks: OfferedSubjectEditableScheduleBlock[], currentId: string) => any;
  occupiedRoomSlots: any;
  resolveSelectedPeriods: (block: any, periods: PeriodConfigItem[]) => PeriodConfigItem[];
  resolveMaxContiguousCount: (periods: PeriodConfigItem[], startPeriod: string) => number;
  isObjectId: (id: string) => boolean;
}

export function ScheduleBlocksSection({
  blocks,
  addBlock,
  removeBlock,
  updateBlock,
  rooms,
  roomsById,
  schedulablePeriods,
  maxCapacity,
  isRoomEligibleForClassType,
  isRoomFreeForDayPeriods,
  mergeOccupancyWithSiblingBlocks,
  occupiedRoomSlots,
  resolveSelectedPeriods,
  resolveMaxContiguousCount,
  isObjectId,
}: ScheduleBlocksSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--line) pb-4">
        <div>
          <div className="flex items-center gap-2.5 text-(--text-dim)">
            <Layers className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-widest">Schedule Blocks</p>
          </div>
          <p className="mt-1 text-xs text-(--text-dim)">
            Assign rooms and time slots for theory, practical, or tutorial sessions.
          </p>
        </div>
        <button
          type="button"
          onClick={addBlock}
          className="focus-ring flex h-10 items-center justify-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-5 text-xs font-bold text-(--text) transition hover:bg-(--surface-muted)"
        >
          <Plus className="h-4 w-4" />
          ADD BLOCK
        </button>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => {
          const selectedPeriods = resolveSelectedPeriods(block, schedulablePeriods);
          const selectedRoom = roomsById.get(block.room);
          const maxCapacityNum = Number(maxCapacity);
          const passesCapacity = (r: Room) =>
            !Number.isFinite(maxCapacityNum) || maxCapacityNum <= 0 || r.capacity >= maxCapacityNum;

          const combinedSlots = mergeOccupancyWithSiblingBlocks(occupiedRoomSlots, blocks, block.id);
          const periodNos = selectedPeriods.map((p) => p.periodNo);
          const hasSlotSelection = Boolean(block.day && periodNos.length > 0);

          const eligibleRooms = rooms
            .filter(passesCapacity)
            .filter((r) => isRoomEligibleForClassType(r, block.classType))
            .filter((r) =>
              !hasSlotSelection ? true : isRoomFreeForDayPeriods(r._id, block.day, periodNos, combinedSlots),
            );

          const eligibleIds = new Set(eligibleRooms.map((room) => room._id));
          const roomSelectList: Room[] = [...eligibleRooms];
          if (
            block.room &&
            selectedRoom &&
            !eligibleIds.has(block.room) &&
            passesCapacity(selectedRoom) &&
            isRoomEligibleForClassType(selectedRoom, block.classType)
          ) {
            roomSelectList.unshift(selectedRoom);
          }

          const currentRoomConflictsSlot =
            hasSlotSelection &&
            block.room &&
            isObjectId(block.room) &&
            !isRoomFreeForDayPeriods(block.room, block.day, periodNos, combinedSlots);

          return (
            <div
              key={block.id}
              className="relative rounded-2xl border border-(--line) bg-(--surface) p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="absolute -left-3 top-6 flex h-6 w-6 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink) shadow-lg">
                {index + 1}
              </div>

              {blocks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBlock(block.id)}
                  className="absolute right-4 top-4 rounded-lg p-2 text-(--text-dim) opacity-40 transition-all hover:bg-red-500/10 hover:text-red-500 hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}

              <div className="grid gap-6 lg:grid-cols-4">
                <div className="space-y-4 lg:col-span-1">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-(--text-dim)">
                      Class Type
                    </label>
                    <select
                      value={block.classType}
                      onChange={(e) => updateBlock(block.id, "classType", e.target.value)}
                      className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-xs font-bold text-(--text) transition-all focus:border-(--accent)"
                    >
                      {OFFERED_SUBJECT_CLASS_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-(--text-dim)">
                      Day
                    </label>
                    <select
                      value={block.day}
                      onChange={(e) => updateBlock(block.id, "day", e.target.value)}
                      className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-xs font-bold text-(--text) transition-all focus:border-(--accent)"
                    >
                      <option value="">Select Day</option>
                      {OFFERED_SUBJECT_DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 lg:col-span-1">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-(--text-dim)">
                      Start Period
                    </label>
                    <select
                      value={block.startPeriod}
                      onChange={(e) => updateBlock(block.id, "startPeriod", e.target.value)}
                      className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-xs font-bold text-(--text) transition-all focus:border-(--accent)"
                    >
                      <option value="">Select Start</option>
                      {schedulablePeriods.map((period) => (
                        <option key={period.periodNo} value={period.periodNo}>
                          P{period.periodNo} ({period.startTime})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-(--text-dim)">
                      Period Count
                    </label>
                    <select
                      value={block.periodCount}
                      onChange={(e) => updateBlock(block.id, "periodCount", e.target.value)}
                      className="focus-ring mt-1.5 h-10 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-xs font-bold text-(--text) transition-all focus:border-(--accent)"
                    >
                      {Array.from({
                        length: resolveMaxContiguousCount(schedulablePeriods, block.startPeriod),
                      }).map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1} Session{i > 0 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4 lg:col-span-2">
                  <div className="h-full space-y-4 rounded-2xl bg-(--surface-muted)/20 p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-widest text-(--text-dim)">
                        Assign Room
                      </label>
                      {hasSlotSelection && (
                        <div className="flex items-center gap-1 text-[10px] font-bold text-(--accent)">
                          <MapPin className="h-3 w-3" />
                          {eligibleRooms.length} Available
                        </div>
                      )}
                    </div>
                    <select
                      value={block.room}
                      onChange={(e) => updateBlock(block.id, "room", e.target.value)}
                      className={`focus-ring h-11 w-full rounded-xl border px-3 text-xs font-bold text-(--text) transition-all focus:border-(--accent) ${
                        currentRoomConflictsSlot ? "border-red-500 bg-red-500/5" : "border-(--line) bg-(--surface)"
                      }`}
                    >
                      <option value="">Select a Room</option>
                      {roomSelectList.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.roomName} (Cap: {room.capacity}) - {room.roomType}
                        </option>
                      ))}
                    </select>

                    {hasSlotSelection ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-(--text-dim)">
                          <Clock className="h-3 w-3" />
                          {selectedPeriods[0]?.startTime} - {selectedPeriods[selectedPeriods.length - 1]?.endTime}
                        </div>
                        {currentRoomConflictsSlot && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-red-500">
                            <AlertCircle className="h-3 w-3" />
                            ROOM ALREADY OCCUPIED
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[10px] italic text-(--text-dim) opacity-60">
                        Select day and periods to check room availability.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
