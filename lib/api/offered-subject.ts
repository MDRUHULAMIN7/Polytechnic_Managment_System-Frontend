import { apiRequest } from "./client";
import type { ApiListData, OfferedSubject, OfferedSubjectDay } from "./types";

export function getOfferedSubjects(query?: URLSearchParams) {
  return apiRequest<ApiListData<OfferedSubject>>("/offered-subject", { query });
}

export function getMyOfferedSubjects(query?: URLSearchParams) {
  return apiRequest<OfferedSubject[]>("/offered-subject/my-offered-subject", { query });
}

export function getOfferedSubjectById(id: string) {
  return apiRequest<OfferedSubject>(`/offered-subject/${id}`);
}

export function createOfferedSubject(payload: {
  semesterRegistration: string;
  academicInstructor: string;
  academicDepartment: string;
  subject: string;
  instructor: string;
  section: number;
  maxCapacity: number;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
}) {
  return apiRequest<OfferedSubject>("/offered-subject/create-offered-Subject", {
    method: "POST",
    body: payload,
  });
}

export function updateOfferedSubject(
  id: string,
  payload: {
    instructor: string;
    maxCapacity: number;
    days: OfferedSubjectDay[];
    startTime: string;
    endTime: string;
  },
) {
  return apiRequest<OfferedSubject>(`/offered-subject/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteOfferedSubject(id: string) {
  return apiRequest<OfferedSubject | null>(`/offered-subject/${id}`, {
    method: "DELETE",
  });
}
