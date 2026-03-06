import type { ReactNode } from "react";
import type {
  PaginationMeta,
  Subject,
  SubjectScopeOption,
  SubjectSortOption,
} from "./index";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

export type SubjectFiltersProps = {
  search: string;
  sort: SubjectSortOption;
  scope?: SubjectScopeOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SubjectSortOption) => void;
  onScopeChange?: (value: SubjectScopeOption) => void;
};

export type SubjectPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type SubjectTableProps = {
  items: Subject[];
  loading: boolean;
  error?: string | null;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subject: Subject) => void;
  onAssign?: (subject: Subject) => void;
  basePath?: string;
  showEdit?: boolean;
  showAssign?: boolean;
  showDelete?: boolean;
  actionsLabel?: string;
};

export type SubjectPageProps = {
  items: Subject[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: SubjectSortOption;
  scope?: SubjectScopeOption;
  error?: string | null;
};

export type SubjectFormModalProps = {
  open: boolean;
  subject?: Subject | null;
  onClose: () => void;
  onSaved: () => void;
};

export type SubjectAssignModalProps = {
  open: boolean;
  subject: Subject | null;
  instructors: Instructor[];
  assignedInstructors: Instructor[];
  loading: boolean;
  onClose: () => void;
  onAssign: (instructorIds: string[]) => Promise<void>;
  onRemove: (instructorId: string) => Promise<void>;
};

export type SubjectDetailsContentProps = {
  details: Subject | null;
  error?: string | null;
};

export type SubjectDetailsModalShellProps = {
  children: ReactNode;
};

export type SubjectServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: SubjectSortOption;
  scope?: SubjectScopeOption;
};

export type SubjectModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export type SubjectFormState = {
  title: string;
  prefix: string;
  code: string;
  credits: string;
  regulation: string;
  preRequisiteIds: string[];
};

export type SubjectAssignState = {
  selected: string[];
};

export type SubjectDetailsHeaderProps = {
  title: string;
  description: string;
};
