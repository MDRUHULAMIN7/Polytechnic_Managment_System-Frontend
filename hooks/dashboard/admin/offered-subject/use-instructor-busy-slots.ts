"use client";

import { useEffect, useState } from "react";
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
  const [slots, setSlots] = useState<BusySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!isObjectId(instructorId) || !isObjectId(semesterRegistrationId)) {
      setSlots([]);
      setError(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);

    getOfferedSubjects({
      page: 1,
      limit: 200,
      instructor: instructorId,
      semesterRegistration: semesterRegistrationId,
      fields: "days,startTime,endTime,subject",
    })
      .then((payload) => {
        if (!active) return;
        setSlots(payload.result ?? []);
      })
      .catch((fetchError) => {
        if (!active) return;
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load schedules."
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, instructorId, semesterRegistrationId]);

  return { slots, loading, error };
}
