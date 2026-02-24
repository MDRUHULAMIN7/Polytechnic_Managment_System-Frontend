import { apiRequest } from "./client";
import type {
  AcademicSemester,
  ApiListData,
  SemesterRegistration,
  SemesterRegistrationShift,
  SemesterRegistrationStatus,
} from "./types";

export function getSemesterRegistrations(query?: URLSearchParams) {
  return apiRequest<ApiListData<SemesterRegistration>>("/semester-registrations", { query });
}

export function getSemesterRegistrationById(id: string) {
  return apiRequest<SemesterRegistration>(`/semester-registrations/${id}`);
}

export function createSemesterRegistration(payload: {
  academicSemester: string;
  status: SemesterRegistrationStatus;
  shift: SemesterRegistrationShift;
  startDate: string;
  endDate: string;
  totalCredit: number;
}) {
  return apiRequest<SemesterRegistration>(
    "/semester-registrations/create-semester-registration",
    {
      method: "POST",
      body: payload,
    },
  );
}

export function updateSemesterRegistration(
  id: string,
  payload: Partial<{
    academicSemester: string;
    status: SemesterRegistrationStatus;
    shift: SemesterRegistrationShift;
    startDate: string;
    endDate: string;
    totalCredit: number;
  }>,
) {
  return apiRequest<SemesterRegistration>(`/semester-registrations/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteSemesterRegistration(id: string) {
  return apiRequest<null>(`/semester-registrations/${id}`, {
    method: "DELETE",
  });
}

export function getAcademicSemesterOptions() {
  return apiRequest<AcademicSemester[]>("/academic-semester");
}
