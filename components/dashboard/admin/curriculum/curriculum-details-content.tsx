"use client";

import { Loader2 } from "lucide-react";
import type { Curriculum } from "@/lib/api/types";
import {
  resolveAcademicDepartmentLabel,
  resolveAcademicSemesterLabel,
  resolveSemesterRegistrationLabel,
  resolveSubjectLabel,
} from "@/lib/utils/curriculum/curriculum-utils";
import { formatDate } from "@/lib/utils/utils";

type CurriculumDetailsContentProps = {
  detailLoading: boolean;
  detailRow: Curriculum | null;
  departmentNameById: Map<string, string>;
  semesterLabelById: Map<string, string>;
  semesterRegistrationLabelById: Map<string, string>;
  subjectLabelById: Map<string, string>;
};

export function CurriculumDetailsContent({
  detailLoading,
  detailRow,
  departmentNameById,
  semesterLabelById,
  semesterRegistrationLabelById,
  subjectLabelById,
}: CurriculumDetailsContentProps) {
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

  const departmentLabel =
    typeof detailRow.academicDepartment === "string"
      ? (departmentNameById.get(detailRow.academicDepartment) ?? detailRow.academicDepartment)
      : resolveAcademicDepartmentLabel(detailRow.academicDepartment);

  const semesterLabel =
    typeof detailRow.academicSemester === "string"
      ? (semesterLabelById.get(detailRow.academicSemester) ?? detailRow.academicSemester)
      : resolveAcademicSemesterLabel(detailRow.academicSemester);

  const semesterRegistrationLabel =
    typeof detailRow.semisterRegistration === "string"
      ? (semesterRegistrationLabelById.get(detailRow.semisterRegistration) ??
        "-")
      : resolveSemesterRegistrationLabel(detailRow.semisterRegistration);

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-semibold">ID:</span> {detailRow._id}
      </p>
      <p>
        <span className="font-semibold">Academic Department:</span>{" "}
        {departmentLabel}
      </p>
      <p>
        <span className="font-semibold">Academic Semester:</span>{" "}
        {semesterLabel}
      </p>
      <p>
        <span className="font-semibold">Semester Registration:</span>{" "}
        {semesterRegistrationLabel}
      </p>
      <p>
        <span className="font-semibold">Session:</span> {detailRow.session}
      </p>
      <p>
        <span className="font-semibold">Regulation:</span> {detailRow.regulation}
      </p>
      <p>
        <span className="font-semibold">Total Credit:</span> {detailRow.totalCredit}
      </p>

      <div>
        <p className="font-semibold">Subjects:</p>
        {detailRow.subjects?.length ? (
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-(--text-dim)">
            {detailRow.subjects.map((subject, index) => (
              <li key={typeof subject === "string" ? `${subject}-${index}` : subject._id}>
                {typeof subject === "string"
                  ? (subjectLabelById.get(subject) ?? "-")
                  : resolveSubjectLabel(subject)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-(--text-dim)">No subjects assigned.</p>
        )}
      </div>

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
