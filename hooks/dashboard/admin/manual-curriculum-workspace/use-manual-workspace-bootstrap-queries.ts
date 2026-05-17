"use client";

import { useQueries } from "@tanstack/react-query";
import { loadStep1SupportData, loadStep2SupportData } from "@/lib/api/dashboard/admin/curriculum-planning";
import { getSemesterOccupancySnapshot } from "@/lib/api/dashboard/admin/offered-subject";
import { getActivePeriodConfig } from "@/lib/api/dashboard/admin/period-config";
import { getRooms } from "@/lib/api/dashboard/admin/room";
import { manualWorkspaceKeys } from "@/lib/api/dashboard/admin/manual-workspace-query-keys";
import type { ManualWorkspaceRouteParams } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";

export function useManualWorkspaceBootstrapQueries(
  params: ManualWorkspaceRouteParams | null,
) {
  return useQueries({
    queries: [
      {
        queryKey: manualWorkspaceKeys.step1Support(),
        queryFn: loadStep1SupportData,
        staleTime: 60_000,
      },
      {
        queryKey: manualWorkspaceKeys.activePeriodConfig(params?.semesterRegistrationId),
        queryFn: () => getActivePeriodConfig(undefined, params?.semesterRegistrationId),
        staleTime: 60_000,
      },
      {
        queryKey: manualWorkspaceKeys.rooms(),
        queryFn: () =>
          getRooms({ page: 1, limit: 400, sort: "roomName", isActive: "true" }),
        staleTime: 60_000,
      },
      {
        queryKey: params
          ? manualWorkspaceKeys.step2Support(
              params.academicDepartmentId,
              params.semesterRegistrationId,
            )
          : ["manual-workspace", "step2", "idle"],
        queryFn: () =>
          params
            ? loadStep2SupportData(
                params.academicDepartmentId,
                params.semesterRegistrationId,
              )
            : Promise.resolve(null),
        enabled: Boolean(params),
        staleTime: 30_000,
      },
      {
        queryKey: params
          ? manualWorkspaceKeys.semesterOccupancySnapshot(params.semesterRegistrationId)
          : ["manual-workspace", "occupancy", "idle"],
        queryFn: async () => {
          if (!params) return [];
          return getSemesterOccupancySnapshot(params.semesterRegistrationId);
        },
        enabled: Boolean(params),
        staleTime: 15_000,
      },
    ],
  });
}
