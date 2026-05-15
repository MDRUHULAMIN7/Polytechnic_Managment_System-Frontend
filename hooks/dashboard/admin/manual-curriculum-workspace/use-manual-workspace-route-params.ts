"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { ManualWorkspaceRouteParams } from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import { isObjectId } from "@/utils/dashboard/admin/utils";

function parsePositiveInt(value: string | null, max = 60): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1 || n > max) return null;
  return n;
}

export function useManualWorkspaceRouteParams(): {
  params: ManualWorkspaceRouteParams | null;
  isComplete: boolean;
} {
  const search = useSearchParams();

  return useMemo(() => {
    const academicInstructorId = search.get("academicInstructorId")?.trim() ?? "";
    const academicDepartmentId = search.get("academicDepartmentId")?.trim() ?? "";
    const semesterRegistrationId = search.get("semesterRegistrationId")?.trim() ?? "";
    const maxCapacity = parsePositiveInt(search.get("maxCapacity"));

    const idsOk =
      isObjectId(academicInstructorId) &&
      isObjectId(academicDepartmentId) &&
      isObjectId(semesterRegistrationId);

    if (!idsOk || maxCapacity === null) {
      return { params: null, isComplete: false };
    }

    return {
      params: {
        academicInstructorId,
        academicDepartmentId,
        semesterRegistrationId,
        maxCapacity,
      },
      isComplete: true,
    };
  }, [search]);
}

export function buildManualWorkspaceSearch(params: ManualWorkspaceRouteParams): string {
  const q = new URLSearchParams({
    academicInstructorId: params.academicInstructorId,
    academicDepartmentId: params.academicDepartmentId,
    semesterRegistrationId: params.semesterRegistrationId,
    maxCapacity: String(params.maxCapacity),
  });
  return `?${q.toString()}`;
}
