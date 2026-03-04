import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";

export type SemesterRegistrationStatus = "UPCOMING" | "ONGOING" | "ENDED";
export type SemesterRegistrationShift = "MORNING" | "DAY";

export type SemesterRegistration = {
  _id: string;
  academicSemester: AcademicSemester | string;
  status: SemesterRegistrationStatus;
  shift: SemesterRegistrationShift;
  startDate: string;
  endDate: string;
  totalCredit: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SemesterRegistrationSortOption =
  | "-createdAt"
  | "createdAt"
  | "startDate"
  | "-startDate"
  | "endDate"
  | "-endDate";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type SemesterRegistrationListPayload = {
  meta: PaginationMeta;
  result: SemesterRegistration[];
};

export type SemesterRegistrationListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: SemesterRegistrationSortOption;
  status?: SemesterRegistrationStatus;
  shift?: SemesterRegistrationShift;
  fields?: string;
};

export type SemesterRegistrationInput = {
  academicSemester: string;
  status: SemesterRegistrationStatus;
  shift: SemesterRegistrationShift;
  startDate: string;
  endDate: string;
  totalCredit: number;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
