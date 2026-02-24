"use client";

import type { SemesterEnrollment } from "@/lib/api/types";
import {
  resolveAcademicSemesterLabel,
  resolveCurriculumLabel,
  resolveDepartmentLabel,
  resolvePaidLabel,
  resolveSemesterRegistrationDateRange,
  resolveSemesterRegistrationMeta,
  resolveStudentLabel,
} from "@/lib/utils/semester-enrollment/semester-enrollment-utils";
import { formatDate } from "@/lib/utils/utils";

type SemesterEnrollmentDetailsContentProps = {
  detailRow: SemesterEnrollment | null;
};

export function SemesterEnrollmentDetailsContent({
  detailRow,
}: SemesterEnrollmentDetailsContentProps) {
  if (!detailRow) {
    return <p className="text-sm text-(--text-dim)">No details available.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p>
        <span className="font-semibold">Student:</span>{" "}
        {resolveStudentLabel(detailRow.student)}
      </p>
      <p>
        <span className="font-semibold">Academic Department:</span>{" "}
        {resolveDepartmentLabel(detailRow.academicDepartment)}
      </p>
      <p>
        <span className="font-semibold">Academic Semester:</span>{" "}
        {resolveAcademicSemesterLabel(detailRow.academicSemester)}
      </p>
      <p>
        <span className="font-semibold">Semester Registration:</span>{" "}
        {resolveSemesterRegistrationDateRange(detailRow.semesterRegistration)}
      </p>
      <p>
        <span className="font-semibold">Registration Meta:</span>{" "}
        {resolveSemesterRegistrationMeta(detailRow.semesterRegistration)}
      </p>
      <p>
        <span className="font-semibold">Curriculum:</span>{" "}
        {resolveCurriculumLabel(detailRow.curriculum)}
      </p>
      <p>
        <span className="font-semibold">Status:</span> {detailRow.status}
      </p>
      <p>
        <span className="font-semibold">Payment:</span>{" "}
        {resolvePaidLabel(detailRow.isPaid)}
      </p>
      <p>
        <span className="font-semibold">Fees:</span> {detailRow.fees ?? 0}
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

