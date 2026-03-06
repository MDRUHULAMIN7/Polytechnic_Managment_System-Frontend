import type { ReactNode } from "react";
import type {
  OfferedSubject,
  OfferedSubjectDay,
  OfferedSubjectInput,
  OfferedSubjectScopeOption,
  OfferedSubjectSortOption,
  PaginationMeta,
} from "./index";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";

export type OfferedSubjectFiltersProps = {
  search: string;
  sort: OfferedSubjectSortOption;
  scope?: OfferedSubjectScopeOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: OfferedSubjectSortOption) => void;
  onScopeChange?: (value: OfferedSubjectScopeOption) => void;
};

export type OfferedSubjectPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type OfferedSubjectTableProps = {
  items: OfferedSubject[];
  loading: boolean;
  error?: string | null;
  onEdit?: (item: OfferedSubject) => void;
  onDelete?: (item: OfferedSubject) => void;
  basePath?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  actionsLabel?: string;
};

export type OfferedSubjectPageProps = {
  items: OfferedSubject[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: OfferedSubjectSortOption;
  subjects: Subject[];
  instructors: Instructor[];
  academicDepartments: AcademicDepartment[];
  academicInstructors: AcademicInstructor[];
  semesterRegistrations: SemesterRegistration[];
  error?: string | null;
};

export type OfferedSubjectListPageProps = {
  items: OfferedSubject[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: OfferedSubjectSortOption;
  scope?: OfferedSubjectScopeOption;
  error?: string | null;
};

export type OfferedSubjectFormModalProps = {
  open: boolean;
  offeredSubject?: OfferedSubject | null;
  subjects: Subject[];
  instructors: Instructor[];
  academicDepartments: AcademicDepartment[];
  academicInstructors: AcademicInstructor[];
  semesterRegistrations: SemesterRegistration[];
  onClose: () => void;
  onSaved: () => void;
};

export type OfferedSubjectDetailsContentProps = {
  details: OfferedSubject | null;
  error?: string | null;
};

export type OfferedSubjectDetailsModalShellProps = {
  children: ReactNode;
};

export type OfferedSubjectModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export type OfferedSubjectServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: OfferedSubjectSortOption;
  scope?: OfferedSubjectScopeOption;
};

export type OfferedSubjectFormState = {
  semesterRegistration: string;
  academicInstructor: string;
  academicDepartment: string;
  subject: string;
  instructor: string;
  section: string;
  maxCapacity: string;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
};

export type OfferedSubjectUpdateState = {
  instructor: string;
  maxCapacity: string;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
};

export type OfferedSubjectInputPayload = OfferedSubjectInput;
