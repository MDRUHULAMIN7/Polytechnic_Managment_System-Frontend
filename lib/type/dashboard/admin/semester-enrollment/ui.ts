import type { SemesterEnrollment, SemesterEnrollmentSortOption, PaginationMeta, SemesterEnrollmentStatus } from "./index";

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

export type SemesterEnrollmentServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: SemesterEnrollmentSortOption;
  status: SemesterEnrollmentStatus | "";
};
