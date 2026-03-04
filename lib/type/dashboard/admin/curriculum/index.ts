import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { Subject } from "@/lib/type/dashboard/admin/subject";

export type Curriculum = {
  _id: string;
  academicDepartment: AcademicDepartment | string;
  academicSemester: AcademicSemester | string;
  semisterRegistration: SemesterRegistration | string;
  regulation: number;
  session: string;
  subjects: Subject[] | string[];
  totalCredit: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CurriculumSortOption = "-createdAt" | "createdAt" | "session" | "-session";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type CurriculumListPayload = {
  meta: PaginationMeta;
  result: Curriculum[];
};

export type CurriculumListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: CurriculumSortOption;
  academicDepartment?: string;
  academicSemester?: string;
  semisterRegistration?: string;
  fields?: string;
};

export type CurriculumInput = {
  academicDepartment: string;
  semisterRegistration: string;
  regulation: number;
  session: string;
  subjects: string[];
};

export type CurriculumUpdateInput = {
  academicDepartment?: string;
  academicSemester?: string;
  semisterRegistration?: string;
  regulation?: number;
  session?: string;
  subjects?: string[];
  totalCredit?: number;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
