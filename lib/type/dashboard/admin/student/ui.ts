import type { ReactNode } from "react";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type {
  PaginationMeta,
  Student,
  StudentSortOption,
  StudentStatus,
} from "./index";

export type StudentFiltersProps = {
  search: string;
  sort: StudentSortOption;
  academicDepartment: string;
  admissionSemester: string;
  departments: AcademicDepartment[];
  semesters: AcademicSemester[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: StudentSortOption) => void;
  onDepartmentChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
};

export type StudentPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type StudentTableProps = {
  items: Student[];
  loading: boolean;
  error?: string | null;
  statusUpdatingId?: string | null;
  canChangeStatus: boolean;
  onStatusChange: (student: Student, nextStatus: StudentStatus) => void;
};

export type StudentPageProps = {
  items: Student[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: StudentSortOption;
  academicDepartment: string;
  admissionSemester: string;
  departments: AcademicDepartment[];
  semesters: AcademicSemester[];
  canChangeStatus: boolean;
  error?: string | null;
};

export type StudentFormModalProps = {
  open: boolean;
  departments: AcademicDepartment[];
  semesters: AcademicSemester[];
  onClose: () => void;
  onSaved: () => void;
};

export type StudentDetailsContentProps = {
  details: Student | null;
  error?: string | null;
};

export type StudentDetailsModalShellProps = {
  children: ReactNode;
};

export type StudentServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: StudentSortOption;
  academicDepartment: string;
  admissionSemester: string;
};

export type StudentModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};
