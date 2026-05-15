import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import {
  buildSemesterRoomOccupancySet,
  expandBlockPeriods,
  normalizeOfferedSubjectDay,
  roomDayPeriodKey,
} from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";

function resolveOfferingInstructorId(
  instructor: OfferedSubject["instructor"],
): string | null {
  if (!instructor) return null;
  if (typeof instructor === "string" && instructor.trim()) {
    return instructor.trim();
  }
  if (typeof instructor === "object") {
    const o = instructor as { _id?: unknown; id?: unknown };
    if (o._id != null) {
      const s = String(o._id).trim();
      if (s) return s;
    }
    if (o.id != null) {
      const s = String(o.id).trim();
      if (s) return s;
    }
  }
  return null;
}

export function buildInstructorPeriodOccupancySet(
  subjects: OfferedSubject[],
  options?: { allowedPeriodNos?: Set<number> },
): Set<string> {
  const allowed = options?.allowedPeriodNos;
  const set = new Set<string>();
  for (const sub of subjects) {
    const instructorId = resolveOfferingInstructorId(sub.instructor);
    if (!instructorId) continue;
    for (const block of sub.scheduleBlocks ?? []) {
      const dayRaw = block.day;
      const dayClean = typeof dayRaw === "string" ? dayRaw.trim() : String(dayRaw ?? "").trim();
      const day = normalizeOfferedSubjectDay(dayClean) || dayClean;
      if (!day) continue;
      const periods = expandBlockPeriods(block);
      for (const p of periods) {
        const pn = Number(p);
        if (!Number.isFinite(pn)) continue;
        if (allowed && allowed.size > 0 && !allowed.has(pn)) {
          continue;
        }
        set.add(`${instructorId}:${day}:${pn}`);
      }
    }
  }
  return set;
}

export function mergeRoomOccupancyWithDraft(
  semesterSlots: Set<string>,
  draftBlocks: Array<{
    room: string;
    day: string;
    startPeriod: number;
    periodCount: number;
  }>,
  allowedPeriodNos?: Set<number>,
): Set<string> {
  const merged = new Set(semesterSlots);
  const allowed = allowedPeriodNos;
  for (const b of draftBlocks) {
    const dayRaw = b.day;
    const dayClean = typeof dayRaw === "string" ? dayRaw.trim() : String(dayRaw ?? "").trim();
    const day = normalizeOfferedSubjectDay(dayClean) || dayClean;
    if (!b.room || !day) continue;
    const start = b.startPeriod;
    const count = b.periodCount;
    if (!Number.isFinite(start) || !Number.isFinite(count) || count <= 0) {
      continue;
    }
    for (let p = start; p < start + count; p += 1) {
      const pn = Number(p);
      if (!Number.isFinite(pn)) continue;
      if (allowed && allowed.size > 0 && !allowed.has(pn)) {
        continue;
      }
      merged.add(roomDayPeriodKey(b.room, day, pn));
    }
  }
  return merged;
}

export function mergeInstructorOccupancyWithDraft(
  semesterSlots: Set<string>,
  instructorId: string,
  draftBlocks: Array<{
    day: string;
    startPeriod: number;
    periodCount: number;
  }>,
  allowedPeriodNos?: Set<number>,
): Set<string> {
  const merged = new Set(semesterSlots);
  if (!instructorId) return merged;

  const allowed = allowedPeriodNos;
  for (const b of draftBlocks) {
    const dayRaw = b.day;
    const dayClean = typeof dayRaw === "string" ? dayRaw.trim() : String(dayRaw ?? "").trim();
    const day = normalizeOfferedSubjectDay(dayClean) || dayClean;
    if (!day) continue;
    const start = b.startPeriod;
    const count = b.periodCount;
    if (!Number.isFinite(start) || !Number.isFinite(count) || count <= 0) {
      continue;
    }
    for (let p = start; p < start + count; p += 1) {
      const pn = Number(p);
      if (!Number.isFinite(pn)) continue;
      if (allowed && allowed.size > 0 && !allowed.has(pn)) {
        continue;
      }
      merged.add(`${instructorId}:${day}:${pn}`);
    }
  }
  return merged;
}

export { buildSemesterRoomOccupancySet, roomDayPeriodKey };
