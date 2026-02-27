import type { ReactNode } from "react";
import type {
  Instructor,
  InstructorSortOption,
  InstructorStatus,
  PaginationMeta,
} from "./index";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";

export type InstructorFiltersProps = {
  search: string;
  sort: InstructorSortOption;
  academicDepartment: string;
  departments: AcademicDepartment[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: InstructorSortOption) => void;
  onDepartmentChange: (value: string) => void;
};

export type InstructorPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type InstructorTableProps = {
  items: Instructor[];
  loading: boolean;
  error?: string | null;
  statusUpdatingId?: string | null;
  canChangeStatus: boolean;
  onStatusChange: (instructor: Instructor, nextStatus: InstructorStatus) => void;
};

export type InstructorPageProps = {
  items: Instructor[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: InstructorSortOption;
  departments: AcademicDepartment[];
  academicDepartment: string;
  error?: string | null;
  canChangeStatus: boolean;
};

export type InstructorFormModalProps = {
  open: boolean;
  departments: AcademicDepartment[];
  onClose: () => void;
  onSaved: () => void;
};

export type InstructorDetailsContentProps = {
  details: Instructor | null;
  error?: string | null;
};

export type InstructorDetailsModalShellProps = {
  children: ReactNode;
};

export type InstructorServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: InstructorSortOption;
  academicDepartment: string;
};

export type InstructorModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};
