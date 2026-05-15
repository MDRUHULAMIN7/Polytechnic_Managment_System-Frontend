"use client";

import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { Room } from "@/lib/type/dashboard/admin/room";
import { resolveInstructorDisplayName } from "@/utils/dashboard/admin/instructor/resolve-display-name";
import { InstructorAvailabilityTable } from "@/components/dashboard/admin/instructor/instructor-availability-table";

export function InstructorsAvailabilityPanel({
  instructors,
  instructorWeekOfferings,
  instructorWeekLoading,
  instructorWeekError,
  draftInstructorId,
  draftBlocks,
  schedulablePeriods,
  rooms,
  draftSubjectTitle,
}: {
  instructors: Instructor[];
  instructorWeekOfferings: OfferedSubject[];
  instructorWeekLoading: boolean;
  instructorWeekError: string | null;
  draftInstructorId: string;
  draftBlocks: ManualWorkspaceDraftBlock[];
  schedulablePeriods: PeriodConfigItem[];
  rooms: Room[];
  draftSubjectTitle: string;
}) {
  const instructorLabel = draftInstructorId
    ? (() => {
        const i = instructors.find((x) => x._id === draftInstructorId);
        return i ? resolveInstructorDisplayName(i.name) : "Selected instructor";
      })()
    : null;

  return (
    <div className="space-y-2">
      {instructorLabel ? (
        <p className="rounded-lg border border-(--line) bg-(--surface-muted)/50 px-2 py-1.5 text-[11px] text-(--text)">
          <span className="text-(--text-dim)">Toolbar instructor · </span>
          <span className="font-medium">{instructorLabel}</span>
        </p>
      ) : (
        <p className="text-[11px] text-(--text-dim)">
          Choose an instructor in the toolbar to mirror their availability here.
        </p>
      )}
      {draftInstructorId ? (
        <div className="max-h-[min(480px,70vh)] overflow-auto">
          <InstructorAvailabilityTable
            schedulablePeriods={schedulablePeriods}
            loading={instructorWeekLoading}
            error={instructorWeekError}
            offeredSubjects={instructorWeekOfferings}
            draftBlocks={draftBlocks}
            rooms={rooms}
            draftSubjectTitle={draftSubjectTitle}
          />
        </div>
      ) : null}
    </div>
  );
}
