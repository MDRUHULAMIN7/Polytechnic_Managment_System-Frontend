import type { ReactNode } from "react";
import type {
  AcademicInstructor,
  AcademicInstructorSortOption,
  PaginationMeta,
} from "./index";

export type AcademicInstructorFiltersProps = {
  search: string;
  sort: AcademicInstructorSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: AcademicInstructorSortOption) => void;
};

export type AcademicInstructorPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type AcademicInstructorTableProps = {
  items: AcademicInstructor[];
  loading: boolean;
  error?: string | null;
  onEdit: (item: AcademicInstructor) => void;
};

export type AcademicInstructorPageProps = {
  items: AcademicInstructor[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: AcademicInstructorSortOption;
  error?: string | null;
};

export type AcademicInstructorFormMode = "create" | "edit";

export type AcademicInstructorFormModalProps = {
  open: boolean;
  mode: AcademicInstructorFormMode;
  instructor?: AcademicInstructor | null;
  onClose: () => void;
  onSaved: () => void;
};

export type AcademicInstructorDetailsContentProps = {
  details: AcademicInstructor | null;
  error?: string | null;
};

export type AcademicInstructorDetailsModalShellProps = {
  children: ReactNode;
};

export type AcademicInstructorServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: AcademicInstructorSortOption;
};

export type AcademicInstructorDetailsModalProps = {
  open: boolean;
  instructorId: string | null;
  onClose: () => void;
};

export type AcademicInstructorModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};
