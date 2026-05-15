import type { ManualWorkspaceDraftBlock } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";

export const manualWorkspaceKeys = {
  root: ["manual-curriculum-workspace"] as const,
  step1Support: () => [...manualWorkspaceKeys.root, "step1-support"] as const,
  step2Support: (departmentId: string, semesterRegistrationId: string) =>
    [
      ...manualWorkspaceKeys.root,
      "step2-support",
      departmentId,
      semesterRegistrationId,
    ] as const,
  /** Semester-scoped offered subjects (full list GET, same populate as admin) for room grid + occupancy sets. */
  semesterOccupancySnapshot: (semesterRegistrationId: string) =>
    [
      ...manualWorkspaceKeys.root,
      "semester-occupancy-snapshot",
      semesterRegistrationId,
    ] as const,
  /** Full offered-subject rows for one instructor (same source as Admin → Instructors → Availability). */
  instructorWeekOfferings: (instructorId: string) =>
    [...manualWorkspaceKeys.root, "instructor-week-offerings", instructorId] as const,
  activePeriodConfig: () =>
    [...manualWorkspaceKeys.root, "active-period-config"] as const,
  rooms: () => [...manualWorkspaceKeys.root, "rooms"] as const,
  schedulePreview: (args: {
    semesterRegistrationId: string;
    academicDepartmentId: string;
    instructorId: string;
    maxCapacity: number;
    blocksKey: string;
  }) => [...manualWorkspaceKeys.root, "schedule-preview", args] as const,
};

export function serializeDraftBlocksForQueryKey(
  blocks: ManualWorkspaceDraftBlock[],
): string {
  return JSON.stringify(
    [...blocks].sort((a, b) => {
      const day = a.day.localeCompare(b.day);
      if (day !== 0) return day;
      if (a.startPeriod !== b.startPeriod) {
        return a.startPeriod - b.startPeriod;
      }
      return a.id.localeCompare(b.id);
    }),
  );
}
