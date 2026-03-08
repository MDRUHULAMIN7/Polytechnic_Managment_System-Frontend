import type { ReactNode } from "react";
import type {
  PaginationMeta,
  SemesterRegistration,
  SemesterRegistrationShift,
  SemesterRegistrationSortOption,
  SemesterRegistrationStatus,
} from "./index";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";

export type SemesterRegistrationFiltersProps = {
  search: string;
  sort: SemesterRegistrationSortOption;
  status: SemesterRegistrationStatus | "";
  shift: SemesterRegistrationShift | "";
  onSearchChange: (value: string) => void;
  onSortChange: (value: SemesterRegistrationSortOption) => void;
  onStatusChange: (value: SemesterRegistrationStatus | "") => void;
  onShiftChange: (value: SemesterRegistrationShift | "") => void;
};

export type SemesterRegistrationPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type SemesterRegistrationTableProps = {
  items: SemesterRegistration[];
  loading: boolean;
  error?: string | null;
  onEdit?: (item: SemesterRegistration) => void;
  onDelete?: (item: SemesterRegistration) => void;
  basePath?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  actionsLabel?: string;
};

export type SemesterRegistrationPageProps = {
  items: SemesterRegistration[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: SemesterRegistrationSortOption;
  status: SemesterRegistrationStatus | "";
  shift: SemesterRegistrationShift | "";
  semesters?: AcademicSemester[];
  error?: string | null;
};

export type SemesterRegistrationFormModalProps = {
  open: boolean;
  registration?: SemesterRegistration | null;
  semesters: AcademicSemester[];
  onClose: () => void;
  onSaved: () => void;
};

export type SemesterRegistrationDetailsContentProps = {
  details: SemesterRegistration | null;
  error?: string | null;
};

export type SemesterRegistrationDetailsModalShellProps = {
  children: ReactNode;
};

export type SemesterRegistrationModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export type SemesterRegistrationServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: SemesterRegistrationSortOption;
  status: SemesterRegistrationStatus | "";
  shift: SemesterRegistrationShift | "";
};

export type SemesterRegistrationFormState = {
  academicSemester: string;
  status: SemesterRegistrationStatus | "";
  shift: SemesterRegistrationShift | "";
  startDate: string;
  endDate: string;
  totalCredit: string;
};
