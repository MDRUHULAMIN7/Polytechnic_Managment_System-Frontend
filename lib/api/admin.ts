import { apiRequest } from "./client";
import type { AdminName, AdminProfile, ApiListData } from "./types";

export function getAdmins<TAdmin = AdminProfile>(query?: URLSearchParams) {
  return apiRequest<ApiListData<TAdmin>>("/admins", { query });
}

export function getAdminById(id: string) {
  return apiRequest<AdminProfile>(`/admins/${id}`);
}

export function createAdmin(payload: {
  password: string;
  admin: {
    designation: string;
    name: AdminName;
    gender: "male" | "female" | "other";
    dateOfBirth?: string;
    email: string;
    contactNo: string;
    emergencyContactNo: string;
    bloogGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    presentAddress: string;
    permanentAddress: string;
    profileImg: string;
  };
}) {
  return apiRequest<AdminProfile[]>("/users/create-admin", {
    method: "POST",
    body: payload,
  });
}
