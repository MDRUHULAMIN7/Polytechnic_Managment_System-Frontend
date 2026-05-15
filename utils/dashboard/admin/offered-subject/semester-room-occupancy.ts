import type {
  OfferedSubject,
  OfferedSubjectClassType,
  OfferedSubjectScheduleBlock,
} from "@/lib/type/dashboard/admin/offered-subject";
import type { Room } from "@/lib/type/dashboard/admin/room";
import { isObjectId } from "@/utils/dashboard/admin/utils";

/** Same slot key shape as curriculum planning: `${roomId}:${day}:${periodNo}` */
export function roomDayPeriodKey(
  roomId: string,
  day: string,
  periodNo: number,
): string {
  return `${roomId}:${day}:${Number(periodNo)}`;
}

export function normalizeOfferedSubjectDay(rawDay: unknown): string | null {
  if (typeof rawDay !== "string") return null;

  const cleaned = rawDay.trim();
  if (!cleaned) return null;

  const lowered = cleaned.toLowerCase();
  const dayMap: Record<string, string> = {
    sat: "Sat",
    saturday: "Sat",
    sun: "Sun",
    sunday: "Sun",
    mon: "Mon",
    monday: "Mon",
    tue: "Tue",
    tues: "Tue",
    tuesday: "Tue",
    wed: "Wed",
    wednesday: "Wed",
    thu: "Thu",
    thur: "Thu",
    thurs: "Thu",
    thursday: "Thu",
    fri: "Fri",
    friday: "Fri",
  };

  return dayMap[lowered] ?? null;
}

export function scheduleBlockRoomId(
  room: OfferedSubjectScheduleBlock["room"],
): string {
  if (typeof room === "string" && room.trim()) {
    return room.trim();
  }
  if (room && typeof room === "object") {
    const idCandidate =
      (room as { _id?: unknown })._id ??
      (room as { id?: unknown }).id ??
      (room as { room?: unknown }).room;

    if (typeof idCandidate === "string" && idCandidate.trim()) {
      return idCandidate.trim();
    }
    if (idCandidate != null) {
      const stringId = String(idCandidate).trim();
      if (stringId) return stringId;
    }
  }
  return "";
}

export function expandPeriodIndices(
  startPeriod: number,
  periodCount: number,
): number[] {
  const out: number[] = [];
  for (let p = startPeriod; p < startPeriod + periodCount; p += 1) {
    out.push(p);
  }
  return out;
}

/** Prefer persisted `periodNumbers`; otherwise derive from start + count. */
export function expandBlockPeriods(block: {
  startPeriod?: number;
  periodCount?: number;
  periodNumbers?: number[];
}): number[] {
  const nums = block.periodNumbers;
  if (Array.isArray(nums) && nums.length > 0) {
    const parsed = nums.map((n) => Number(n)).filter((n) => Number.isFinite(n));
    if (parsed.length > 0) return parsed;
  }
  const start = Number(block.startPeriod);
  const count = Number(block.periodCount);
  if (!Number.isFinite(start) || !Number.isFinite(count) || count <= 0) {
    return [];
  }
  return expandPeriodIndices(start, count);
}

export function addOfferedSubjectRoomSlots(
  subject: Pick<OfferedSubject, "scheduleBlocks">,
  target: Set<string>,
  allowedPeriodNos?: Set<number> | null,
): void {
  for (const block of subject.scheduleBlocks ?? []) {
    const roomId = scheduleBlockRoomId(block.room);
    const day = normalizeOfferedSubjectDay(block.day);
    if (!roomId || !day) continue;
    const periods = expandBlockPeriods(block);
    for (const p of periods) {
      const pn = Number(p);
      if (!Number.isFinite(pn)) continue;
      if (allowedPeriodNos && allowedPeriodNos.size > 0 && !allowedPeriodNos.has(pn)) {
        continue;
      }
      target.add(roomDayPeriodKey(roomId, day, pn));
    }
  }
}

export function buildSemesterRoomOccupancySet(
  subjects: OfferedSubject[],
  options: {
    excludeOfferedSubjectId?: string;
    /** When set, only slots whose periodNo exists in the active period config are recorded. */
    allowedPeriodNos?: Set<number>;
  } = {},
): Set<string> {
  const set = new Set<string>();
  const allowed = options.allowedPeriodNos;
  for (const sub of subjects) {
    if (
      options.excludeOfferedSubjectId &&
      sub._id === options.excludeOfferedSubjectId
    ) {
      continue;
    }
    addOfferedSubjectRoomSlots(sub, set, allowed);
  }
  return set;
}

/** Marks editable form blocks (other than the current row) on the occupancy set. */
export function addFormBlockRoomSlots(
  block: {
    room: string;
    day: string;
    startPeriod: string;
    periodCount: string;
  },
  target: Set<string>,
): void {
  if (!isObjectId(block.room) || !block.day) return;
  const start = Number(block.startPeriod);
  const count = Number(block.periodCount);
  if (!Number.isFinite(start) || !Number.isFinite(count) || count <= 0) {
    return;
  }
  for (const p of expandPeriodIndices(start, count)) {
    target.add(roomDayPeriodKey(block.room, block.day, p));
  }
}

export function mergeOccupancyWithSiblingBlocks(
  semesterSlots: Set<string>,
  blocks: Array<{
    id: string;
    room: string;
    day: string;
    startPeriod: string;
    periodCount: string;
  }>,
  excludeBlockId: string,
): Set<string> {
  const merged = new Set(semesterSlots);
  for (const b of blocks) {
    if (b.id === excludeBlockId) continue;
    addFormBlockRoomSlots(b, merged);
  }
  return merged;
}

/** Mirrors backend planner: practical only in practical/both rooms; theory/tutorial allow any. */
export function isRoomEligibleForClassType(
  room: Room,
  classType: OfferedSubjectClassType,
): boolean {
  if (classType === "practical") {
    return room.roomType === "practical" || room.roomType === "both";
  }
  return true;
}

export function isRoomFreeForDayPeriods(
  roomId: string,
  day: string,
  periodNumbers: number[],
  occupied: Set<string>,
): boolean {
  return !periodNumbers.some((periodNo) =>
    occupied.has(roomDayPeriodKey(roomId, day, periodNo)),
  );
}
