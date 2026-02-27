import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";

export type AcademicDepartment = {
  _id: string;
  name: string;
  academicInstructor?: AcademicInstructor | string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AcademicDepartmentSortOption =
  | "-createdAt"
  | "createdAt"
  | "name"
  | "-name";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type AcademicDepartmentListPayload = {
  meta: PaginationMeta;
  result: AcademicDepartment[];
};

export type AcademicDepartmentListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: AcademicDepartmentSortOption;
  academicInstructor?: string;
};

export type AcademicDepartmentInput = {
  name: string;
  academicInstructor: string;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
