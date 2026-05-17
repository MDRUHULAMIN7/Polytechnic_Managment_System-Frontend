import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import {
  expandBlockPeriods,
  normalizeOfferedSubjectDay,
  roomDayPeriodKey,
} from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";

export type OccupancyInfo = {
  subjectId: string;
  subjectTitle?: string;
  instructorId: string;
  instructorName?: string;
  classType: string;
  room?: string;
  isDraft?: boolean;
};

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

export function buildInstructorPeriodOccupancyMap(
  subjects: OfferedSubject[],
  options?: { allowedPeriodNos?: Set<number> },
): Map<string, OccupancyInfo> {
  const allowed = options?.allowedPeriodNos;
  const map = new Map<string, OccupancyInfo>();
  for (const sub of subjects) {
    const instructorId = resolveOfferingInstructorId(sub.instructor);
    if (!instructorId) continue;

    const subjectId = typeof sub.subject === "string" ? sub.subject : sub.subject?._id || "";
    const subjectTitle = typeof sub.subject === "object" ? sub.subject?.title : undefined;

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
        map.set(`${instructorId}:${day}:${pn}`, {
          subjectId,
          subjectTitle,
          instructorId,
          classType: block.classType,
          room: typeof block.room === "string" ? block.room : block.room?._id,
        });
      }
    }
  }
  return map;
}

export function buildSemesterRoomOccupancyMap(
  subjects: OfferedSubject[],
  options?: { allowedPeriodNos?: Set<number> },
): Map<string, OccupancyInfo> {
  const allowed = options?.allowedPeriodNos;
  const map = new Map<string, OccupancyInfo>();
  for (const sub of subjects) {
    const subjectId = typeof sub.subject === "string" ? sub.subject : sub.subject?._id || "";
    const subjectTitle = typeof sub.subject === "object" ? sub.subject?.title : undefined;
    const instructorId = resolveOfferingInstructorId(sub.instructor) || "";

    for (const block of sub.scheduleBlocks ?? []) {
      const roomId = typeof block.room === "string" ? block.room : block.room?._id;
      if (!roomId) continue;

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
        map.set(roomDayPeriodKey(roomId, day, pn), {
          subjectId,
          subjectTitle,
          instructorId,
          classType: block.classType,
          room: roomId,
        });
      }
    }
  }
  return map;
}

export function mergeRoomOccupancyMapWithDraft(
  semesterMap: Map<string, OccupancyInfo>,
  draftBlocks: Array<ManualWorkspaceDraftBlock>,
  options: {
    allowedPeriodNos?: Set<number>;
    draftSubjectTitle?: string;
    draftInstructorLabel?: string;
  },
): Map<string, OccupancyInfo> {
  const merged = new Map(semesterMap);
  const allowed = options.allowedPeriodNos;
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
      merged.set(roomDayPeriodKey(b.room, day, pn), {
        subjectId: b.subjectId,
        subjectTitle: options.draftSubjectTitle,
        instructorId: b.instructorId,
        instructorName: options.draftInstructorLabel,
        classType: b.classType,
        room: b.room,
        isDraft: true,
      });
    }
  }
  return merged;
}

export function mergeInstructorOccupancyMapWithDraft(
  semesterMap: Map<string, OccupancyInfo>,
  instructorId: string,
  draftBlocks: Array<ManualWorkspaceDraftBlock>,
  options: {
    allowedPeriodNos?: Set<number>;
    draftSubjectTitle?: string;
    draftInstructorLabel?: string;
  },
): Map<string, OccupancyInfo> {
  const merged = new Map(semesterMap);
  if (!instructorId) return merged;

  const allowed = options.allowedPeriodNos;
  for (const b of draftBlocks) {
    if (b.instructorId !== instructorId) continue;

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
      merged.set(`${instructorId}:${day}:${pn}`, {
        subjectId: b.subjectId,
        subjectTitle: options.draftSubjectTitle,
        instructorId: b.instructorId,
        instructorName: options.draftInstructorLabel,
        classType: b.classType,
        room: b.room,
        isDraft: true,
      });
    }
  }
  return merged;
}

export function buildInstructorPeriodOccupancySet(
  subjects: OfferedSubject[],
  options?: { allowedPeriodNos?: Set<number> },
): Set<string> {
  const map = buildInstructorPeriodOccupancyMap(subjects, options);
  return new Set(map.keys());
}

export function buildSemesterRoomOccupancySet(
  subjects: OfferedSubject[],
  options?: { allowedPeriodNos?: Set<number> },
): Set<string> {
  const map = buildSemesterRoomOccupancyMap(subjects, options);
  return new Set(map.keys());
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
    instructorId: string;
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
    if (b.instructorId !== instructorId) continue;

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

export { roomDayPeriodKey, normalizeOfferedSubjectDay };
