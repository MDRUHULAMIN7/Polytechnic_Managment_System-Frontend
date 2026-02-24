import { apiRequest } from "./client";
import type {
  AcademicSemester,
  AcademicSemesterCode,
  AcademicSemesterMonth,
  AcademicSemesterName,
} from "./types";

export function getAcademicSemesters(query?: URLSearchParams) {
  return apiRequest<AcademicSemester[]>("/academic-semester", { query });
}

export function getAcademicSemesterById(id: string) {
  return apiRequest<AcademicSemester>(`/academic-semester/${id}`);
}

export function createAcademicSemester(payload: {
  name: AcademicSemesterName;
  code: AcademicSemesterCode;
  year: string;
  startMonth: AcademicSemesterMonth;
  endMonth: AcademicSemesterMonth;
}) {
  return apiRequest<AcademicSemester>("/academic-semester/create-academic-semester", {
    method: "POST",
    body: payload,
  });
}

export function updateAcademicSemester(
  id: string,
  payload: Partial<{
    name: AcademicSemesterName;
    code: AcademicSemesterCode;
    year: string;
    startMonth: AcademicSemesterMonth;
    endMonth: AcademicSemesterMonth;
  }>,
) {
  return apiRequest<AcademicSemester>(`/academic-semester/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
