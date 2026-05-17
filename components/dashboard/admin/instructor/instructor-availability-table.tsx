"use client";

import { useMemo } from "react";
import type { OfferedSubject, OfferedSubjectScheduleBlock } from "@/lib/type/dashboard/admin/offered-subject";
import { OFFERED_SUBJECT_DAYS } from "@/lib/type/dashboard/admin/offered-subject/constants";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";

function resolveSubjectTitle(item: OfferedSubject, subjects?: Subject[]) {
  if (typeof item.subject === "string") {
    if (subjects?.length) {
      const s = subjects.find((x) => x._id === item.subject);
      if (s) return s.title.trim();
    }
    return item.subject;
  }
  return item.subject?.title?.trim() || "Subject";
}

function resolveRoomLabel(room: OfferedSubjectScheduleBlock["room"]) {
  if (typeof room !== "string") {
    return room ? `${room.roomName} ${room.roomNumber}`.trim() : "Room";
  }
  return room.trim() ? room : "Room";
}

function resolveDraftRoomLabel(roomId: string, rooms?: Room[]) {
  if (!rooms?.length) return roomId;
  const r = rooms.find((x) => x._id === roomId);
  return r ? `${r.roomName} ${r.roomNumber}`.trim() : roomId;
}

function buildWeekOccupancyMap(
  offeredSubjects: OfferedSubject[],
  options?: {
    instructorId?: string;
    draftBlocks?: ManualWorkspaceDraftBlock[];
    rooms?: Room[];
    subjects?: Subject[];
    draftSubjectTitle?: string;
  },
): Map<string, { subject: string; room: string; classType: string }> {
  const map = new Map<string, { subject: string; room: string; classType: string }>();

  offeredSubjects.forEach((offeredSubject) => {
    offeredSubject.scheduleBlocks?.forEach((block) => {
      const subject = resolveSubjectTitle(offeredSubject, options?.subjects);
      const room = resolveRoomLabel(block.room);
      const start = Number(block.startPeriod);
      const count = Number(block.periodCount);
      if (!Number.isFinite(start) || !Number.isFinite(count) || count <= 0) return;
      for (let period = start; period < start + count; period += 1) {
        map.set(`${block.day}-${period}`, {
          subject,
          room,
          classType: block.classType,
        });
      }
    });
  });

  if (options?.draftBlocks?.length && options.instructorId) {
    for (const b of options.draftBlocks) {
      if (b.instructorId !== options.instructorId) continue;

      const subject = options.subjects?.find((s) => s._id === b.subjectId)?.title || options.draftSubjectTitle || "New offering (draft)";
      const room = resolveDraftRoomLabel(b.room, options.rooms);

      const start = Number(b.startPeriod);
      const count = Number(b.periodCount);
      if (!Number.isFinite(start) || !Number.isFinite(count) || count <= 0) continue;
      for (let period = start; period < start + count; period += 1) {
        map.set(`${b.day}-${period}`, {
          subject,
          room,
          classType: b.classType,
        });
      }
    }
  }

  return map;
}

export type InstructorAvailabilityTableProps = {
  schedulablePeriods: PeriodConfigItem[];
  loading: boolean;
  error: string | null;
  offeredSubjects: OfferedSubject[];
  /** Manual workspace: overlay draft blocks on top of DB offerings for the same grid. */
  instructorId?: string;
  draftBlocks?: ManualWorkspaceDraftBlock[];
  rooms?: Room[];
  subjects?: Subject[];
  draftSubjectTitle?: string;
  /** When false, hide legend (e.g. nested in toolbar). */
  showLegend?: boolean;
};

/**
 * Same week grid as Admin → Instructors → Availability modal:
 * blocked cells show subject, room, class type; free cells show “Free”.
 */
export function InstructorAvailabilityTable({
  schedulablePeriods,
  loading,
  error,
  offeredSubjects,
  instructorId,
  draftBlocks,
  rooms,
  subjects,
  draftSubjectTitle,
  showLegend = true,
}: InstructorAvailabilityTableProps) {
  const occupancy = useMemo(
    () =>
      buildWeekOccupancyMap(offeredSubjects, {
        instructorId,
        draftBlocks,
        rooms,
        subjects,
        draftSubjectTitle,
      }),
    [offeredSubjects, instructorId, draftBlocks, rooms, subjects, draftSubjectTitle],
  );

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
            Blocked (teaching)
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
                  const slot = Number.isFinite(pn) ? occupancy.get(`${day}-${pn}`) : undefined;
                  return (
                    <td key={`${day}-${period.periodNo}`} className="px-2 py-2 align-top">
                      {slot ? (
                        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2">
                          <p className="font-semibold text-(--text)">{slot.subject}</p>
                          <p className="mt-1 text-[10px] text-(--text-dim)">{slot.room}</p>
                          <p className="mt-1 text-[10px] uppercase text-red-300">{slot.classType}</p>
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
