"use client";

import { Loader2 } from "lucide-react";
import type { OfferedSubject } from "@/lib/api/types";
import { formatDate } from "@/lib/utils/utils";
import {
  resolveAcademicSemesterName,
  resolveAcademicDepartmentLabel,
  resolveAcademicInstructorLabel,
  resolveInstructorLabel,
  resolveSemesterShiftFromSemesterRegistration,
  resolveSemesterStatusFromSemesterRegistration,
  resolveSubjectLabel,
} from "@/lib/utils/offered-subject/offered-subject-utils";

type OfferedSubjectDetailsContentProps = {
  detailLoading: boolean;
  detailRow: OfferedSubject | null;
};

export function OfferedSubjectDetailsContent({
  detailLoading,
  detailRow,
}: OfferedSubjectDetailsContentProps) {
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
        <span className="font-semibold">Subject:</span>{" "}
        {resolveSubjectLabel(detailRow.subject)}
      </p>
      <p>
        <span className="font-semibold">Semester:</span>{" "}
        {resolveAcademicSemesterName(detailRow.academicSemester)}
      </p>
      <p>
        <span className="font-semibold">Shift:</span>{" "}
        {resolveSemesterShiftFromSemesterRegistration(detailRow.semesterRegistration)}
      </p>
      <p>
        <span className="font-semibold">Status:</span>{" "}
        {resolveSemesterStatusFromSemesterRegistration(detailRow.semesterRegistration)}
      </p>
      <p>
        <span className="font-semibold">Academic Instructor:</span>{" "}
        {resolveAcademicInstructorLabel(detailRow.academicInstructor)}
      </p>
      <p>
        <span className="font-semibold">Academic Department:</span>{" "}
        {resolveAcademicDepartmentLabel(detailRow.academicDepartment)}
      </p>
      <p>
        <span className="font-semibold">Instructor:</span>{" "}
        {resolveInstructorLabel(detailRow.instructor)}
      </p>
      <p>
        <span className="font-semibold">Section:</span> {detailRow.section}
      </p>
      <p>
        <span className="font-semibold">Max Capacity:</span>{" "}
        {detailRow.maxCapacity}
      </p>
      <p>
        <span className="font-semibold">Days:</span>{" "}
        {Array.isArray(detailRow.days) && detailRow.days.length > 0
          ? detailRow.days.join(", ")
          : "-"}
      </p>
      <p>
        <span className="font-semibold">Time:</span> {detailRow.startTime} -{" "}
        {detailRow.endTime}
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
