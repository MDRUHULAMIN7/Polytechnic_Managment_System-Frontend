"use client";

import { Loader2 } from "lucide-react";
import type { AcademicSemester } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/utils";

type AcademicSemesterDetailsContentProps = {
  detailLoading: boolean;
  detailRow: AcademicSemester | null;
};

export function AcademicSemesterDetailsContent({
  detailLoading,
  detailRow,
}: AcademicSemesterDetailsContentProps) {
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
        <span className="font-semibold">Code:</span> {detailRow.code}
      </p>
      <p>
        <span className="font-semibold">Year:</span> {detailRow.year}
      </p>
      <p>
        <span className="font-semibold">Start Month:</span> {detailRow.startMonth}
      </p>
      <p>
        <span className="font-semibold">End Month:</span> {detailRow.endMonth}
      </p>
      <p>
        <span className="font-semibold">Updated:</span> {formatDate(detailRow.updatedAt)}
      </p>
    </div>
  );
}
