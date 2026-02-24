import { apiRequest } from "./client";
import type { ApiListData, InstructorProfile } from "./types";

export function getInstructors<TInstructor = InstructorProfile>(query?: URLSearchParams) {
  return apiRequest<ApiListData<TInstructor>>("/instructors", { query });
}

export function getInstructorById(id: string) {
  return apiRequest<InstructorProfile>(`/instructors/${id}`);
}

type CreateInstructorPayload = {
  password: string;
  instructor: {
    designation: string;
    name: {
      firstName: string;
      middleName: string;
      lastName: string;
    };
    gender: "male" | "female" | "other";
    dateOfBirth?: string;
    email: string;
    contactNo: string;
    emergencyContactNo: string;
    bloogGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    presentAddress: string;
    permanentAddress: string;
    academicDepartment: string;
    profileImg?: string;
  };
  file?: File | null;
};

export function createInstructor(payload: CreateInstructorPayload) {
  const form = new FormData();
  form.append(
    "data",
    JSON.stringify({
      password: payload.password,
      instructor: payload.instructor,
    }),
  );
  if (payload.file) {
    form.append("file", payload.file);
  }

  return apiRequest<InstructorProfile[]>("/users/create-instructor", {
    method: "POST",
    body: form,
  });
}
