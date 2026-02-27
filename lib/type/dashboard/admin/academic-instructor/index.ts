export type AcademicInstructor = {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AcademicInstructorSortOption =
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

export type AcademicInstructorListPayload = {
  meta: PaginationMeta;
  result: AcademicInstructor[];
};

export type AcademicInstructorListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: AcademicInstructorSortOption;
};

export type AcademicInstructorInput = {
  name: string;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
