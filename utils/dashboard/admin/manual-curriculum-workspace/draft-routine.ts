import type {
  ManualWorkspaceDraftBlock,
} from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";
import {
  doTimeRangesOverlap,
} from "@/utils/dashboard/admin/manual-curriculum-workspace/time-overlap";
import { normalizeOfferedSubjectDay } from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";

type PeriodSlice = { periodNo: number; startTime: string; endTime: string };

export function periodsForBlock(
  startPeriod: number,
  periodCount: number,
): number[] {
  const out: number[] = [];
  for (let p = startPeriod; p < startPeriod + periodCount; p += 1) {
    out.push(p);
  }
  return out;
}

export function blocksShareSlot(
  a: Pick<ManualWorkspaceDraftBlock, "day" | "startPeriod" | "periodCount">,
  b: Pick<ManualWorkspaceDraftBlock, "day" | "startPeriod" | "periodCount">,
): boolean {
  const dayA = normalizeOfferedSubjectDay(a.day);
  const dayB = normalizeOfferedSubjectDay(b.day);
  if (!dayA || !dayB || dayA !== dayB) return false;

  const aEnd = a.startPeriod + a.periodCount;
  const bEnd = b.startPeriod + b.periodCount;
  return a.startPeriod < bEnd && aEnd > b.startPeriod;
}

export function draftBlocksOverlapInRoom(
  blocks: ManualWorkspaceDraftBlock[],
): boolean {
  for (let i = 0; i < blocks.length; i += 1) {
    for (let j = i + 1; j < blocks.length; j += 1) {
      const a = blocks[i];
      const b = blocks[j];
      if (a.room !== b.room) continue;
      if (blocksShareSlot(a, b)) return true;
    }
  }
  return false;
}

/** True if any two blocks overlap in time on the same day (same instructor draft). */
export function draftBlocksOverlapInTime(
  blocks: ManualWorkspaceDraftBlock[],
  schedulablePeriods: PeriodSlice[],
): boolean {
  const byNo = new Map(
    schedulablePeriods.map((p) => [p.periodNo, p] as const),
  );
  for (let i = 0; i < blocks.length; i += 1) {
    for (let j = i + 1; j < blocks.length; j += 1) {
      const a = blocks[i];
      const b = blocks[j];
      if (a.day !== (b.day as OfferedSubjectDay)) continue;
      if (!blocksShareSlot(a, b)) continue;
      const aStart = byNo.get(a.startPeriod)?.startTime;
      const aEnd = byNo.get(a.startPeriod + a.periodCount - 1)?.endTime;
      const bStart = byNo.get(b.startPeriod)?.startTime;
      const bEnd = byNo.get(b.startPeriod + b.periodCount - 1)?.endTime;
      if (!aStart || !aEnd || !bStart || !bEnd) continue;
      if (doTimeRangesOverlap(aStart, aEnd, bStart, bEnd)) return true;
    }
  }
  return false;
}

export function findBlocksCoveringCell(
  blocks: ManualWorkspaceDraftBlock[],
  day: OfferedSubjectDay,
  periodNo: number,
): ManualWorkspaceDraftBlock[] {
  return blocks.filter(
    (b) =>
      b.day === day &&
      periodNo >= b.startPeriod &&
      periodNo < b.startPeriod + b.periodCount,
  );
}
