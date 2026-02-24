"use client";

import { Loader2 } from "lucide-react";
import type { AcademicDepartment } from "@/lib/api/types";
import { resolveAcademicDepartmentInstructorName } from "@/lib/utils/academic-department/academic-department-utils";
import { formatDate } from "@/lib/utils/utils";

type AcademicDepartmentDetailsContentProps = {
  detailLoading: boolean;
  detailRow: AcademicDepartment | null;
};

export function AcademicDepartmentDetailsContent({
  detailLoading,
  detailRow,
}: AcademicDepartmentDetailsContentProps) {
  if (detailLoading) {
    return (
      <div className="flex min-h-24 items-center justify-center text-sm text-(--text-dim)">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
        Loading details...
      </div>
    );
  }

  if (!detailRow) {
    return <p className="text-sm text-(--text-dim)">No details available.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-semibold">ID:</span> {detailRow._id}
      </p>
      <p>
        <span className="font-semibold">Name:</span> {detailRow.name}
      </p>
      <p>
        <span className="font-semibold">Academic Instructor:</span>{" "}
        {resolveAcademicDepartmentInstructorName(detailRow)}
      </p>
      <p>
        <span className="font-semibold">Created:</span> {formatDate(detailRow.createdAt)}
      </p>
      <p>
        <span className="font-semibold">Updated:</span> {formatDate(detailRow.updatedAt)}
      </p>
    </div>
  );
}
