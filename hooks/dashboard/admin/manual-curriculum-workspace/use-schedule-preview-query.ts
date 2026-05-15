"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkScheduleConflicts } from "@/lib/api/dashboard/admin/curriculum-planning";
import { manualWorkspaceKeys, serializeDraftBlocksForQueryKey } from "@/lib/api/dashboard/admin/manual-workspace-query-keys";
import type {
  ManualWorkspaceDraft,
  ManualWorkspaceDraftBlock,
  ManualWorkspaceRouteParams,
} from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import type { OfferedSubjectScheduleBlock } from "@/lib/type/dashboard/admin/offered-subject";
import { useDebouncedValue } from "@/utils/common/use-debounced-value";

function draftBlocksToPreviewPayload(
  blocks: ManualWorkspaceDraftBlock[],
): OfferedSubjectScheduleBlock[] {
  return blocks.map((b) => ({
    classType: b.classType,
    day: b.day,
    room: b.room,
    startPeriod: b.startPeriod,
    periodCount: b.periodCount,
  }));
}

export function useSchedulePreviewQuery(
  context: ManualWorkspaceRouteParams | null,
  draft: ManualWorkspaceDraft,
  debounceMs = 400,
) {
  const queryClient = useQueryClient();
  const blocksKey = serializeDraftBlocksForQueryKey(draft.blocks);
  const debouncedKey = useDebouncedValue(blocksKey, debounceMs);

  const enabled =
    Boolean(context) &&
    Boolean(draft.subjectId) &&
    Boolean(draft.instructorId) &&
    draft.blocks.length > 0;

  const query = useQuery({
    queryKey: context
      ? manualWorkspaceKeys.schedulePreview({
          semesterRegistrationId: context.semesterRegistrationId,
          academicDepartmentId: context.academicDepartmentId,
          instructorId: draft.instructorId,
          maxCapacity: draft.maxCapacity,
          blocksKey: debouncedKey,
        })
      : ["manual-workspace", "preview", "idle"],
    queryFn: () => {
      if (!context) {
        throw new Error("Missing planning context");
      }
      return checkScheduleConflicts({
        semesterRegistrationId: context.semesterRegistrationId,
        academicDepartmentId: context.academicDepartmentId,
        instructorId: draft.instructorId,
        maxCapacity: draft.maxCapacity,
        scheduleBlocks: draftBlocksToPreviewPayload(draft.blocks),
      });
    },
    enabled,
    staleTime: 0,
    gcTime: 300_000,
  });

  function invalidateScheduleData() {
    if (!context) return;
    void queryClient.invalidateQueries({
      queryKey: manualWorkspaceKeys.semesterOccupancySnapshot(
        context.semesterRegistrationId,
      ),
    });
    void queryClient.invalidateQueries({
      queryKey: [...manualWorkspaceKeys.root, "schedule-preview"],
    });
    if (draft.instructorId) {
      void queryClient.invalidateQueries({
        queryKey: manualWorkspaceKeys.instructorWeekOfferings(draft.instructorId),
      });
    }
  }

  return { ...query, invalidateScheduleData };
}
