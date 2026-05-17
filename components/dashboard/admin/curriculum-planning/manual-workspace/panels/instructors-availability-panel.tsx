"use client";

import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { PeriodConfigItem } from "@/lib/type/dashboard/admin/period-config";
import type { Room } from "@/lib/type/dashboard/admin/room";
import { InstructorAvailabilityTable } from "@/components/dashboard/admin/instructor/instructor-availability-table";
import { ConflictsPanel } from "./conflicts-panel";
import type { SchedulePreviewConflict } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";

export function InstructorsAvailabilityPanel({
  instructorWeekOfferings,
  instructorWeekLoading,
  instructorWeekError,
  draftInstructorId,
  draftBlocks,
  schedulablePeriods,
  rooms,
  subjects,
  draftSubjectTitle,
  instructorLabel,
  conflicts = [],
  conflictsLoading = false,
}: {
  instructorWeekOfferings: OfferedSubject[];
  instructorWeekLoading: boolean;
  instructorWeekError: string | null;
  draftInstructorId: string;
  draftBlocks: ManualWorkspaceDraftBlock[];
  schedulablePeriods: PeriodConfigItem[];
  rooms: Room[];
  subjects: Subject[];
  draftSubjectTitle: string;
  instructorLabel: string;
  conflicts?: SchedulePreviewConflict[];
  conflictsLoading?: boolean;
}) {

  return (
    <div className="space-y-4">
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
        <div className="overflow-auto">
          <InstructorAvailabilityTable
            schedulablePeriods={schedulablePeriods}
            loading={instructorWeekLoading}
            error={instructorWeekError}
            offeredSubjects={instructorWeekOfferings}
            instructorId={draftInstructorId}
            draftBlocks={draftBlocks}
            rooms={rooms}
            subjects={subjects}
            draftSubjectTitle={draftSubjectTitle}
            showLegend={false}
          />
        </div>
      ) : null}

      {conflicts.length > 0 && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-400/80">
            Instructor Conflicts
          </h4>
          <ConflictsPanel conflicts={conflicts} isLoading={conflictsLoading} />
        </div>
      )}
    </div>
  );
}
