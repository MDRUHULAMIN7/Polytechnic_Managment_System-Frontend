"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRoomAvailabilityData } from "@/utils/dashboard/admin/room/room-availability.service";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { PeriodConfigItem, PeriodConfig } from "@/lib/type/dashboard/admin/period-config";

export type UseRoomAvailabilityResult = {
  offeredSubjects: OfferedSubject[];
  schedulablePeriods: PeriodConfigItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<unknown>;
};

export function useRoomAvailabilityData(enabled: boolean): UseRoomAvailabilityResult {
  const query = useQuery({
    queryKey: ["admin", "room-availability-data"],
    queryFn: fetchRoomAvailabilityData,
    enabled,
    staleTime: 30_000,
  });

  const schedulablePeriods = useMemo(() => {
    const periodConfig = query.data?.periodConfig as PeriodConfig | undefined;
    if (!periodConfig?.periods?.length) {
      return [];
    }

    return [...periodConfig.periods]
      .filter((period) => period.isActive !== false && period.isBreak !== true)
      .sort((left, right) => left.periodNo - right.periodNo);
  }, [query.data]);

  const error = query.error instanceof Error ? query.error.message : query.isError ? "Failed to load room availability." : null;

  return {
    offeredSubjects: query.data?.offeredSubjects ?? [],
    schedulablePeriods,
    loading: Boolean(enabled && query.isFetching),
    error,
    refetch: query.refetch,
  };
}
