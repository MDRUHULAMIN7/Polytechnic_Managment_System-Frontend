"use client";

import { Loader2 } from "lucide-react";
import type { SemesterRegistration } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/utils";
import { resolveSemesterLabel } from "@/lib/utils/semester-registration/semester-registration-utils";

type SemesterRegistrationDetailsContentProps = {
  detailLoading: boolean;
  detailRow: SemesterRegistration | null;
};

export function SemesterRegistrationDetailsContent({
  detailLoading,
  detailRow,
}: SemesterRegistrationDetailsContentProps) {
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
        <span className="font-semibold">Academic Semester:</span>{" "}
        {resolveSemesterLabel(detailRow.academicSemester)}
      </p>
      <p>
        <span className="font-semibold">Status:</span> {detailRow.status}
      </p>
      <p>
        <span className="font-semibold">Shift:</span> {detailRow.shift}
      </p>
      <p>
        <span className="font-semibold">Start Date:</span>{" "}
        {formatDate(detailRow.startDate)}
      </p>
      <p>
        <span className="font-semibold">End Date:</span>{" "}
        {formatDate(detailRow.endDate)}
      </p>
      <p>
        <span className="font-semibold">Total Credit:</span>{" "}
        {detailRow.totalCredit}
      </p>
      <p>
        <span className="font-semibold">Created:</span>{" "}
        {formatDate(detailRow.createdAt)}
      </p>
      <p>
        <span className="font-semibold">Updated:</span>{" "}
        {formatDate(detailRow.updatedAt)}
      </p>
    </div>
  );
}
