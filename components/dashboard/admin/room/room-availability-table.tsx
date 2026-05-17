"use client";

import { useMemo } from "react";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import { OFFERED_SUBJECT_DAYS } from "@/lib/type/dashboard/admin/offered-subject/constants";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import {
  expandBlockPeriods,
  scheduleBlockRoomId,
} from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";
import { resolveInstructorDisplayName } from "@/utils/dashboard/admin/instructor/resolve-display-name";

function normalizeOfferedSubjectDay(rawDay: unknown): string | null {
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

function toLabel(value: unknown, fallback: string) {
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return fallback;
}

function resolveSubjectTitle(item: OfferedSubject, subjects?: Subject[]) {
  if (typeof item.subject === "string") {
    if (subjects?.length) {
      const s = subjects.find((x) => x._id === item.subject);
      if (s) return s.title.trim();
    }
    return item.subject;
  }
  return toLabel(item.subject?.title, "Unnamed Subject");
}

function resolveInstructorName(item: OfferedSubject, instructors?: Instructor[]) {
  if (typeof item.instructor === "string") {
    if (instructors?.length) {
      const i = instructors.find((x) => x._id === item.instructor);
      if (i) {
        const name = i.name;
        const parts = [name.firstName, name.middleName, name.lastName]
          .map((part) => (typeof part === "string" ? part.trim() : ""))
          .filter(Boolean);
        if (parts.length) return parts.join(" ");
      }
    }
    return item.instructor;
  }
  const name = item.instructor?.name;
  if (name && typeof name === "object") {
    const parts = [name.firstName, name.middleName, name.lastName]
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  return "Instructor";
}

export type OccupancyEntry = {
  subject: string;
  instructor: string;
  classType: string;
  isDraft?: boolean;
};

export function buildRoomWeekOccupancyMap(
  offeredSubjects: OfferedSubject[],
  roomId: string,
  options?: {
    draftBlocks?: ManualWorkspaceDraftBlock[];
    subjects?: Subject[];
    instructors?: Instructor[];
    draftSubjectTitle?: string;
    draftInstructorLabel?: string;
    allowedPeriodNos?: Set<number>;
  },
): Map<string, OccupancyEntry[]> {
  const map = new Map<string, OccupancyEntry[]>();
  if (!roomId) return map;

  const allowed = options?.allowedPeriodNos;

  function addEntry(key: string, entry: OccupancyEntry) {
    const existing = map.get(key) || [];
    map.set(key, [...existing, entry]);
  }

  for (const offeredSubject of offeredSubjects) {
    const subject = resolveSubjectTitle(offeredSubject, options?.subjects);
    const instructor = resolveInstructorName(offeredSubject, options?.instructors);
    for (const block of offeredSubject.scheduleBlocks ?? []) {
      const bid = scheduleBlockRoomId(block.room);
      if (!bid || bid !== roomId) continue;
      const day = normalizeOfferedSubjectDay(block.day);
      if (!day) continue;
      const periods = expandBlockPeriods(block);
      for (const period of periods) {
        const pn = Number(period);
        if (!Number.isFinite(pn)) continue;
        if (allowed && allowed.size > 0 && !allowed.has(pn)) continue;
        addEntry(`${day}-${pn}`, {
          subject,
          instructor,
          classType: block.classType,
        });
      }
    }
  }

  if (options?.draftBlocks?.length) {
    for (const b of options.draftBlocks) {
      if (b.room !== roomId) continue;

      const subject = options.subjects?.find((s) => s._id === b.subjectId)?.title || options.draftSubjectTitle || "New offering (draft)";
      const instructor = options.instructors?.find((i) => i._id === b.instructorId);
      const instructorLabel = instructor ? resolveInstructorDisplayName(instructor.name) : options.draftInstructorLabel || "Draft instructor";

      const dayRaw = b.day;
      const dayClean = typeof dayRaw === "string" ? dayRaw.trim() : String(dayRaw ?? "").trim();
      const day = normalizeOfferedSubjectDay(dayClean) || dayClean;
      if (!day) continue;
      const start = Number(b.startPeriod);
      const count = Number(b.periodCount);
      if (!Number.isFinite(start) || !Number.isFinite(count) || count <= 0) continue;
      for (let period = start; period < start + count; period += 1) {
        if (allowed && allowed.size > 0 && !allowed.has(period)) continue;
        addEntry(`${day}-${period}`, {
          subject,
          instructor: instructorLabel,
          classType: b.classType,
          isDraft: true,
        });
      }
    }
  }

  return map;
}

export type RoomAvailabilityTableProps = {
  schedulablePeriods: PeriodConfigItem[];
  loading: boolean;
  error: string | null;
  offeredSubjects: OfferedSubject[];
  roomId: string;
  draftBlocks?: ManualWorkspaceDraftBlock[];
  subjects?: Subject[];
  instructors?: Instructor[];
  draftSubjectTitle?: string;
  draftInstructorLabel?: string;
  allowedPeriodNos?: Set<number>;
  showLegend?: boolean;
};

/**
 * Same week grid as Admin → Rooms → availability modal:
 * blocked cells show subject, instructor, class type; free cells show “Free”.
 */
export function RoomAvailabilityTable({
  schedulablePeriods,
  loading,
  error,
  offeredSubjects,
  roomId,
  draftBlocks,
  subjects,
  instructors,
  draftSubjectTitle,
  draftInstructorLabel,
  allowedPeriodNos,
  showLegend = true,
}: RoomAvailabilityTableProps) {
  const occupancy = useMemo(
    () =>
      buildRoomWeekOccupancyMap(offeredSubjects, roomId, {
        draftBlocks,
        subjects,
        instructors,
        draftSubjectTitle,
        draftInstructorLabel,
        allowedPeriodNos,
      }),
    [
      offeredSubjects,
      roomId,
      draftBlocks,
      subjects,
      instructors,
      draftSubjectTitle,
      draftInstructorLabel,
      allowedPeriodNos,
    ],
  );

  if (!roomId) {
    return (
      <div className="rounded-xl border border-(--line) bg-(--surface-muted) p-4 text-sm text-(--text-dim)">
        Select a room to load the weekly grid.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-10 animate-pulse rounded-lg bg-(--surface-muted)" />
        <div className="h-48 animate-pulse rounded-lg bg-(--surface-muted)" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>
    );
  }

  if (schedulablePeriods.length === 0) {
    return (
      <div className="rounded-xl border border-(--line) bg-(--surface-muted) p-4 text-sm text-(--text-dim)">
        No active period configuration found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showLegend ? (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-1 text-red-300">
            Blocked
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-emerald-300">
            Free
          </span>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-(--line)">
        <table className="min-w-full text-xs">
          <thead className="bg-(--surface-muted)">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-(--text-dim)">Day / Period</th>
              {schedulablePeriods.map((period) => (
                <th key={period.periodNo} className="px-3 py-2 text-left font-semibold text-(--text-dim)">
                  <div>P{period.periodNo}</div>
                  <div className="text-[10px] font-normal opacity-70">
                    {period.startTime}-{period.endTime}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {OFFERED_SUBJECT_DAYS.map((day) => (
              <tr key={day} className="border-t border-(--line)">
                <td className="px-3 py-2 font-semibold text-(--text-dim)">{day}</td>
                {schedulablePeriods.map((period) => {
                  const pn = Number(period.periodNo);
                  const slots = Number.isFinite(pn) ? occupancy.get(`${day}-${pn}`) : undefined;
                  const hasConflict = (slots?.length ?? 0) > 1;

                  return (
                    <td key={`${day}-${period.periodNo}`} className="px-2 py-2 align-top">
                      {slots && slots.length > 0 ? (
                        <div className="space-y-1">
                          {slots.map((slot, idx) => (
                            <div
                              key={idx}
                              className={`rounded-lg border p-2 ${
                                hasConflict
                                  ? "border-amber-500/50 bg-amber-500/10"
                                  : slot.isDraft
                                    ? "border-blue-500/30 bg-blue-500/10"
                                    : "border-red-500/30 bg-red-500/10"
                              }`}
                            >
                              <p className="font-semibold text-(--text)">{slot.subject}</p>
                              <p className="mt-1 text-[10px] text-(--text-dim)">{slot.instructor}</p>
                              <div className="mt-1 flex items-center justify-between">
                                <p
                                  className={`text-[10px] uppercase ${
                                    hasConflict ? "text-amber-300" : "text-red-300"
                                  }`}
                                >
                                  {slot.classType}
                                </p>
                                {slot.isDraft && (
                                  <span className="rounded bg-blue-500/20 px-1 text-[9px] text-blue-300">
                                    DRAFT
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                          {hasConflict && (
                            <p className="mt-1 text-[9px] font-bold uppercase tracking-tighter text-amber-500">
                              Conflict detected
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-[11px] font-medium text-emerald-300">
                          Free
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
