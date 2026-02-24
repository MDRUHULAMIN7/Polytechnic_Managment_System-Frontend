import { apiRequest } from "./client";
import type { ApiListData, Curriculum } from "./types";

export function getCurriculums(query?: URLSearchParams) {
  return apiRequest<ApiListData<Curriculum>>("/curriculums", { query });
}

export function getCurriculumById(id: string) {
  return apiRequest<Curriculum>(`/curriculums/${id}`);
}

export function createCurriculum(payload: {
  academicDepartment: string;
  semisterRegistration: string;
  regulation: number;
  session: string;
  subjects: string[];
}) {
  return apiRequest<Curriculum>("/curriculums/create-curriculum", {
    method: "POST",
    body: payload,
  });
}

export function updateCurriculum(
  id: string,
  payload: Partial<{
    academicDepartment: string;
    academicSemester: string;
    semisterRegistration: string;
    regulation: number;
    session: string;
    subjects: string[];
    totalCredit: number;
  }>,
) {
  return apiRequest<Curriculum>(`/curriculums/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteCurriculum(id: string) {
  return apiRequest<Curriculum | null>(`/curriculums/${id}`, {
    method: "DELETE",
  });
}
