import type { ReactNode } from "react";
import type { SemesterEnrollment, SemesterEnrollmentSortOption, PaginationMeta, SemesterEnrollmentStatus } from "./index";
import type { Curriculum } from "@/lib/type/dashboard/admin/curriculum";

export type SemesterEnrollmentFiltersProps = {
  search: string;
  sort: SemesterEnrollmentSortOption;
  status: SemesterEnrollmentStatus | "";
  onSearchChange: (value: string) => void;
  onSortChange: (value: SemesterEnrollmentSortOption) => void;
  onStatusChange: (value: SemesterEnrollmentStatus | "") => void;
};

export type SemesterEnrollmentPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type SemesterEnrollmentTableProps = {
  items: SemesterEnrollment[];
  loading: boolean;
  error?: string | null;
  basePath?: string;
  showView?: boolean;
  viewLabel?: string;
  actionsLabel?: string;
};

export type SemesterEnrollmentPageProps = {
  items: SemesterEnrollment[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: SemesterEnrollmentSortOption;
  status: SemesterEnrollmentStatus | "";
  error?: string | null;
};

export type SemesterEnrollmentDetailsContentProps = {
  details: SemesterEnrollment | null;
  error?: string | null;
};

export type SemesterEnrollmentDetailsModalShellProps = {
  children: ReactNode;
};

export type SemesterEnrollmentModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export type SemesterEnrollmentServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: SemesterEnrollmentSortOption;
  status: SemesterEnrollmentStatus | "";
};

export type SemesterEnrollmentFormState = {
  curriculum: string;
};

export type SemesterEnrollmentFormModalProps = {
  open: boolean;
  curriculums: Curriculum[];
  onClose: () => void;
  onSaved: () => void;
};

export type SemesterEnrollmentStudentPageProps = SemesterEnrollmentPageProps & {
  curriculums: Curriculum[];
};
