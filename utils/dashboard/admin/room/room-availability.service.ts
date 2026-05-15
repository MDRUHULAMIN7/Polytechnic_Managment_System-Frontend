import { getActivePeriodConfig } from "@/lib/api/dashboard/admin/period-config";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { PeriodConfig } from "@/lib/type/dashboard/admin/period-config";

export type RoomAvailabilityData = {
  offeredSubjects: OfferedSubject[];
  periodConfig: PeriodConfig;
};

export async function fetchRoomAvailabilityData(): Promise<RoomAvailabilityData> {
  const [periodConfig, offeredSubjectsResponse] = await Promise.all([
    getActivePeriodConfig(),
    getOfferedSubjects({ page: 1, limit: 1000, sort: "-createdAt" }),
  ]);

  return {
    periodConfig,
    offeredSubjects: offeredSubjectsResponse.result ?? [],
  };
}
