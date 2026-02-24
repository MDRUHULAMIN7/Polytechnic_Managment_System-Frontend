import { apiRequest } from "./client";
import type { ApiListData, SemesterEnrollment } from "./types";

export function getSemesterEnrollments(query?: URLSearchParams) {
  return apiRequest<ApiListData<SemesterEnrollment>>("/semester-enrollments", {
    query,
  });
}

export function getMySemesterEnrollments() {
  return apiRequest<SemesterEnrollment[]>("/semester-enrollments/my-semester-enrollments");
}

export function createSemesterEnrollment(payload: { curriculum: string }) {
  return apiRequest<{
    semesterEnrollment: SemesterEnrollment;
    enrolledSubjects: Array<Record<string, unknown>>;
  }>("/semester-enrollments/create-semester-enrollment", {
    method: "POST",
    body: payload,
  });
}
