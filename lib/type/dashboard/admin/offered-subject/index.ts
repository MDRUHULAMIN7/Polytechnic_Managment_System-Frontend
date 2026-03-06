import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";

export type OfferedSubjectDay =
  | "Sat"
  | "Sun"
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri";

export type OfferedSubject = {
  _id: string;
  semesterRegistration: SemesterRegistration | string;
  academicSemester: AcademicSemester | string;
  academicInstructor: AcademicInstructor | string;
  academicDepartment: AcademicDepartment | string;
  subject: Subject | string;
  instructor: Instructor | string;
  maxCapacity: number;
  section: number;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
};

export type OfferedSubjectSortOption = "-createdAt" | "createdAt";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type OfferedSubjectListPayload = {
  meta: PaginationMeta;
  result: OfferedSubject[];
};

export type OfferedSubjectListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: OfferedSubjectSortOption;
  semesterRegistration?: string;
  academicDepartment?: string;
  academicInstructor?: string;
  subject?: string;
  instructor?: string;
  fields?: string;
};

export type OfferedSubjectMyListParams = {
  page?: number;
  limit?: number;
};

export type OfferedSubjectInput = {
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
};

export type OfferedSubjectUpdateInput = {
  instructor: string;
  maxCapacity: number;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
};

export type ApiResponse<T> = {
  [x: string]: any;
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
