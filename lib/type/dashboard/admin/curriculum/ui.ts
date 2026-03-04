import type { ReactNode } from "react";
import type {
  Curriculum,
  CurriculumInput,
  CurriculumSortOption,
  PaginationMeta,
} from "./index";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";

export type CurriculumFiltersProps = {
  search: string;
  sort: CurriculumSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: CurriculumSortOption) => void;
};

export type CurriculumPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type CurriculumTableProps = {
  items: Curriculum[];
  loading: boolean;
  error?: string | null;
  onEdit?: (item: Curriculum) => void;
  onDelete?: (item: Curriculum) => void;
  basePath?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  actionsLabel?: string;
};

export type CurriculumPageProps = {
  items: Curriculum[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: CurriculumSortOption;
  academicDepartments: AcademicDepartment[];
  semesterRegistrations: SemesterRegistration[];
  subjects: Subject[];
  offeredSubjects: OfferedSubject[];
  error?: string | null;
};

export type CurriculumListPageProps = {
  items: Curriculum[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: CurriculumSortOption;
  error?: string | null;
};

export type CurriculumFormModalProps = {
  open: boolean;
  curriculum?: Curriculum | null;
  academicDepartments: AcademicDepartment[];
  semesterRegistrations: SemesterRegistration[];
  subjects: Subject[];
  offeredSubjects: OfferedSubject[];
  onClose: () => void;
  onSaved: () => void;
};

export type CurriculumDetailsContentProps = {
  details: Curriculum | null;
  error?: string | null;
};

export type CurriculumDetailsModalShellProps = {
  children: ReactNode;
};

export type CurriculumModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export type CurriculumServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: CurriculumSortOption;
};

export type CurriculumFormState = {
  academicDepartment: string;
  semisterRegistration: string;
  regulation: string;
  session: string;
  subjects: string[];
};

export type CurriculumInputPayload = CurriculumInput;
