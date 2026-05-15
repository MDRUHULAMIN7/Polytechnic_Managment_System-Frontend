"use client";

import { useQuery } from "@tanstack/react-query";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import { isObjectId } from "@/utils/dashboard/admin/utils";
import { buildSemesterRoomOccupancySet } from "@/utils/dashboard/admin/offered-subject/semester-room-occupancy";

type Args = {
  open: boolean;
  semesterRegistrationId: string;
  excludeOfferedSubjectId?: string;
};

export function useSemesterRoomOccupancy({
  open,
  semesterRegistrationId,
  excludeOfferedSubjectId,
}: Args) {
  const shouldFetch = open && isObjectId(semesterRegistrationId);

  const query = useQuery({
    queryKey: [
      "semester-room-occupancy",
      semesterRegistrationId,
      excludeOfferedSubjectId ?? "",
    ],
    enabled: shouldFetch,
    queryFn: async () => {
      const payload = await getOfferedSubjects({
        page: 1,
        limit: 1000,
        sort: "-createdAt",
        semesterRegistration: semesterRegistrationId,
        fields: "_id,scheduleBlocks",
      });
      return buildSemesterRoomOccupancySet(payload.result ?? [], {
        excludeOfferedSubjectId,
      });
    },
  });

  return {
    occupiedRoomSlots: query.data ?? new Set<string>(),
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
