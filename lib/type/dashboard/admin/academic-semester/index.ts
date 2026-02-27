export type AcademicSemesterMonth =
  | "January"
  | "February"
  | "March"
  | "April"
  | "May"
  | "June"
  | "July"
  | "August"
  | "September"
  | "October"
  | "November"
  | "December";

export type AcademicSemesterName =
  | "First"
  | "Second"
  | "Third"
  | "Fourth"
  | "Fifth"
  | "Sixth"
  | "Seventh"
  | "Eighth";

export type AcademicSemesterCode =
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08";

export type AcademicSemester = {
  _id: string;
  name: AcademicSemesterName;
  code: AcademicSemesterCode;
  year: string;
  startMonth: AcademicSemesterMonth;
  endMonth: AcademicSemesterMonth;
  createdAt?: string;
  updatedAt?: string;
};

export type AcademicSemesterSortOption =
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

export type AcademicSemesterListPayload = {
  meta: PaginationMeta;
  result: AcademicSemester[];
};

export type AcademicSemesterListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: AcademicSemesterSortOption;
  name?: AcademicSemesterName;
};

export type AcademicSemesterInput = {
  name: AcademicSemesterName;
  code: AcademicSemesterCode;
  year: string;
  startMonth: AcademicSemesterMonth;
  endMonth: AcademicSemesterMonth;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
