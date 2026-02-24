import { apiRequest } from "./client";
import type { AcademicInstructor } from "./types";

export function getAcademicInstructors(query?: URLSearchParams) {
  return apiRequest<AcademicInstructor[]>("/academic-instructor", { query });
}

export function getAcademicInstructorById(id: string) {
  return apiRequest<AcademicInstructor>(`/academic-instructor/${id}`);
}

export function createAcademicInstructor(payload: { name: string }) {
  return apiRequest<AcademicInstructor>("/academic-instructor/create-academic-instructor", {
    method: "POST",
    body: payload,
  });
}

export function updateAcademicInstructor(id: string, payload: { name: string }) {
  return apiRequest<AcademicInstructor>(`/academic-instructor/${id}`, {
    method: "PATCH",
    body: payload,
  });
}
