import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { Curriculum } from "@/lib/type/dashboard/admin/curriculum";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { Student } from "@/lib/type/dashboard/admin/student";

export type SemesterEnrollmentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export type SemesterEnrollment = {
  _id: string;
  student: Student | string;
  curriculum: Curriculum | string;
  semesterRegistration: SemesterRegistration | string;
  academicSemester: AcademicSemester | string;
  academicDepartment: AcademicDepartment | string;
  status: SemesterEnrollmentStatus;
  fees: number;
  isPaid: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SemesterEnrollmentSortOption = "-createdAt" | "createdAt";

export type SemesterEnrollmentInput = {
  curriculum: string;
};

export type SemesterEnrollmentCreateResult = {
  semesterEnrollment: SemesterEnrollment;
  enrolledSubjects: unknown[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type SemesterEnrollmentListPayload = {
  meta: PaginationMeta;
  result: SemesterEnrollment[];
};

export type SemesterEnrollmentListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: SemesterEnrollmentSortOption;
  status?: SemesterEnrollmentStatus;
  fields?: string;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
