import type { ReactNode } from "react";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type {
  AcademicDepartment,
  AcademicDepartmentSortOption,
  PaginationMeta,
} from "./index";

export type AcademicDepartmentFiltersProps = {
  search: string;
  sort: AcademicDepartmentSortOption;
  academicInstructor: string;
  instructors: AcademicInstructor[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: AcademicDepartmentSortOption) => void;
  onInstructorChange: (value: string) => void;
};

export type AcademicDepartmentPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type AcademicDepartmentTableProps = {
  items: AcademicDepartment[];
  loading: boolean;
  error?: string | null;
  onEdit: (item: AcademicDepartment) => void;
};

export type AcademicDepartmentPageProps = {
  items: AcademicDepartment[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: AcademicDepartmentSortOption;
  academicInstructor: string;
  instructors: AcademicInstructor[];
  error?: string | null;
};

export type AcademicDepartmentFormMode = "create" | "edit";

export type AcademicDepartmentFormModalProps = {
  open: boolean;
  mode: AcademicDepartmentFormMode;
  department?: AcademicDepartment | null;
  instructors: AcademicInstructor[];
  onClose: () => void;
  onSaved: () => void;
};

export type AcademicDepartmentDetailsContentProps = {
  details: AcademicDepartment | null;
  error?: string | null;
};

export type AcademicDepartmentDetailsModalShellProps = {
  children: ReactNode;
};

export type AcademicDepartmentServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: AcademicDepartmentSortOption;
  academicInstructor: string;
};

export type AcademicDepartmentModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};
