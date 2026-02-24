import { apiRequest } from "./client";
import type { ApiListData, SubjectInstructorAssignment, SubjectProfile } from "./types";

export function getSubjects<TSubject = SubjectProfile>(query?: URLSearchParams) {
  return apiRequest<ApiListData<TSubject>>("/subjects", { query });
}

export function getSubjectById(id: string) {
  return apiRequest<SubjectProfile>(`/subjects/${id}`);
}

export function createSubject(payload: {
  title: string;
  prefix: string;
  code: number;
  credits: number;
  regulation: number;
  preRequisiteSubjects?: { subject: string; isDeleted?: boolean }[];
}) {
  return apiRequest<SubjectProfile>("/subjects/create-subject", {
    method: "POST",
    body: payload,
  });
}

export function updateSubject(
  id: string,
  payload: Partial<{
    title: string;
    prefix: string;
    code: number;
    credits: number;
    regulation: number;
    preRequisiteSubjects: { subject: string; isDeleted?: boolean }[];
    isDeleted: boolean;
  }>,
) {
  return apiRequest<SubjectProfile>(`/subjects/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSubject(id: string) {
  return apiRequest<SubjectProfile>(`/subjects/${id}`, {
    method: "DELETE",
  });
}

export function assignInstructorsToSubject(
  subjectId: string,
  payload: { instructors: string[] },
) {
  return apiRequest<SubjectInstructorAssignment>(`/subjects/${subjectId}/assign-instructors`, {
    method: "PUT",
    body: payload,
  });
}

export function getInstructorsWithSubject(subjectId: string) {
  return apiRequest<SubjectInstructorAssignment | null>(
    `/subjects/${subjectId}/get-instructor`,
  );
}

export function removeInstructorsFromSubject(
  subjectId: string,
  payload: { instructors: string[] },
) {
  return apiRequest<SubjectInstructorAssignment>(`/subjects/${subjectId}/remove-instructors`, {
    method: "DELETE",
    body: payload,
  });
}
