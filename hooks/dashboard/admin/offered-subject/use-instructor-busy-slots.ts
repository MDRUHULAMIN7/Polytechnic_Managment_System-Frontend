"use client";

import { useQuery } from "@tanstack/react-query";
import type { OfferedSubjectDay } from "@/lib/type/dashboard/admin/offered-subject";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import { isObjectId } from "@/utils/dashboard/admin/utils";

type BusySlot = {
  _id: string;
  days?: OfferedSubjectDay[];
  startTime?: string;
  endTime?: string;
  subject?: { title?: string } | string;
};

type UseInstructorBusySlotsArgs = {
  open: boolean;
  instructorId: string;
  semesterRegistrationId: string;
};

export function useInstructorBusySlots({
  open,
  instructorId,
  semesterRegistrationId,
}: UseInstructorBusySlotsArgs) {
  const shouldFetch =
    open &&
    isObjectId(instructorId) &&
    isObjectId(semesterRegistrationId);

  const query = useQuery({
    queryKey: ["instructor-busy-slots", instructorId, semesterRegistrationId],
    enabled: shouldFetch,
    queryFn: async () => {
      const payload = await getOfferedSubjects({
        page: 1,
        limit: 200,
        instructor: instructorId,
        semesterRegistration: semesterRegistrationId,
        fields: "days,startTime,endTime,subject",
      });

      return payload.result ?? [];
    },
  });

  return {
    slots: shouldFetch ? ((query.data ?? []) as BusySlot[]) : [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
