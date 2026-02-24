import type { AdminProfile } from "@/lib/types/api";

export type SearchParamsLike = {
  get: (key: string) => string | null;
};

export type AdminSortOrder = "name" | "-name";

export type AdminTableState = {
  searchTerm: string;
  sort: AdminSortOrder;
  page: number;
  limit: number;
};

export type CreateAdminFormValues = {
  password: string;
  designation: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  contactNo: string;
  emergencyContactNo: string;
  bloogGroup: string;
  presentAddress: string;
  permanentAddress: string;
  profileImg: string;
};

export type AdminTableRow = Pick<
  AdminProfile,
  "_id" | "id" | "designation" | "name" | "email" | "user" | "profileImg"
>;
