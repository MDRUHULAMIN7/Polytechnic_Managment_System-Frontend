import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

export type SubjectPreRequisite = {
  subject: Subject | string;
  isDeleted?: boolean;
};

export type Subject = {
  _id: string;
  title: string;
  prefix: string;
  code: number;
  credits: number;
  regulation: number;
  preRequisiteSubjects?: SubjectPreRequisite[];
  isDeleted?: boolean;
};

export type SubjectSortOption = "title" | "-title" | "code" | "-code";
export type SubjectScopeOption = "all" | "my";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type SubjectListPayload = {
  meta: PaginationMeta;
  result: Subject[];
};

export type SubjectListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: SubjectSortOption;
  scope?: SubjectScopeOption;
  fields?: string;
};

export type SubjectInput = {
  title: string;
  prefix: string;
  code: number;
  credits: number;
  regulation: number;
  preRequisiteSubjects?: {
    subject: string;
    isDeleted?: boolean;
  }[];
};

export type SubjectInstructor = {
  _id?: string;
  subject?: Subject | string;
  instructors: Instructor[];
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
