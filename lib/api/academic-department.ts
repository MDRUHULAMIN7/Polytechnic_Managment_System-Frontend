import { apiRequest } from "./client";
import type { AcademicDepartment } from "./types";

export function getAcademicDepartments(query?: URLSearchParams) {
  return apiRequest<AcademicDepartment[]>("/academic-department", { query });
}

export function getAcademicDepartmentById(id: string) {
  return apiRequest<AcademicDepartment>(`/academic-department/${id}`);
}

export function createAcademicDepartment(payload: { name: string; academicInstructor: string }) {
  return apiRequest<AcademicDepartment>("/academic-department/create-academic-department", {
    method: "POST",
    body: payload,
  });
}

export function updateAcademicDepartment(
  id: string,
  payload: Partial<{ name: string; academicInstructor: string }>,
) {
  return apiRequest<AcademicDepartment>(`/academic-department/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
