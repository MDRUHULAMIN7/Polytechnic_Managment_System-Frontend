import { apiRequest } from "./client";
import type { ApiListData, StudentProfile, StudentGuardian, StudentLocalGuardian } from "./types";

export function getStudents<TStudent = StudentProfile>(query?: URLSearchParams) {
  return apiRequest<ApiListData<TStudent>>("/students", { query });
}

export function getStudentById(id: string) {
  return apiRequest<StudentProfile>(`/students/${id}`);
}

export type CreateStudentPayload = {
  password: string;
  studentData: {
    name: {
      firstName: string;
      middleName?: string;
      lastName: string;
    };
    gender: "male" | "female" | "others";
    dateOfBirth?: string;
    email: string;
    contactNo: string;
    emergencyContactNo: string;
    bloodGroup?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    presentAddress: string;
    permanentAddress: string;
    guardian: StudentGuardian;
    localGuardian: StudentLocalGuardian;
    admissionSemester: string;
    academicDepartment: string;
    profileImg?: string;
  };
  file?: File | null;
};

export function createStudent(payload: CreateStudentPayload) {
  const form = new FormData();
  form.append(
    "data",
    JSON.stringify({
      password: payload.password,
      studentData: payload.studentData,
    }),
  );
  if (payload.file) {
    form.append("file", payload.file);
  }

  return apiRequest<StudentProfile[]>("/users/create-student", {
    method: "POST",
    body: form,
  });
}

export type UpdateStudentPayload = Partial<{
  name: Partial<{
    firstName: string;
    middleName: string;
    lastName: string;
  }>;
  gender: "male" | "female" | "others";
  dateOfBirth: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  presentAddress: string;
  permanentAddress: string;
  guardian: Partial<StudentGuardian>;
  localGuardian: Partial<StudentLocalGuardian>;
  admissionSemester: string;
  academicDepartment: string;
  profileImg: string;
  isDeleted: boolean;
}>;

export function updateStudent(id: string, payload: UpdateStudentPayload) {
  return apiRequest<StudentProfile>(`/students/${id}`, {
    method: "PATCH",
    body: { student: payload },
  });
}

export function deleteStudent(id: string) {
  return apiRequest<StudentProfile | null>(`/students/${id}`, {
    method: "DELETE",
  });
}
