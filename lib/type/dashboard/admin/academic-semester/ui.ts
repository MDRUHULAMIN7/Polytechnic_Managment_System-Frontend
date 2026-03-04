import type { ReactNode } from "react";
import type {
  AcademicSemester,
  AcademicSemesterName,
  AcademicSemesterSortOption,
  PaginationMeta,
} from "./index";

export type AcademicSemesterFiltersProps = {
  search: string;
  sort: AcademicSemesterSortOption;
  name: AcademicSemesterName | "";
  onSearchChange: (value: string) => void;
  onSortChange: (value: AcademicSemesterSortOption) => void;
  onNameChange: (value: AcademicSemesterName | "") => void;
};

export type AcademicSemesterPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type AcademicSemesterTableProps = {
  items: AcademicSemester[];
  loading: boolean;
  error?: string | null;
  onEdit?: (item: AcademicSemester) => void;
  basePath?: string;
  showEdit?: boolean;
  actionsLabel?: string;
};

export type AcademicSemesterPageProps = {
  items: AcademicSemester[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: AcademicSemesterSortOption;
  name: AcademicSemesterName | "";
  error?: string | null;
};

export type AcademicSemesterFormMode = "create" | "edit";

export type AcademicSemesterFormModalProps = {
  open: boolean;
  mode: AcademicSemesterFormMode;
  semester?: AcademicSemester | null;
  onClose: () => void;
  onSaved: () => void;
};

export type AcademicSemesterDetailsContentProps = {
  details: AcademicSemester | null;
  error?: string | null;
};

export type AcademicSemesterDetailsModalShellProps = {
  children: ReactNode;
};

export type AcademicSemesterServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: AcademicSemesterSortOption;
  name: AcademicSemesterName | "";
};

export type AcademicSemesterModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};
