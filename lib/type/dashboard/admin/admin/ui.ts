import type { ReactNode } from "react";
import type { Admin, AdminSortOption, AdminStatus, PaginationMeta } from "./index";

export type AdminFiltersProps = {
  search: string;
  sort: AdminSortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: AdminSortOption) => void;
};

export type AdminPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type AdminTableProps = {
  items: Admin[];
  loading: boolean;
  error?: string | null;
  statusUpdatingId?: string | null;
  canChangeStatus: boolean;
  onStatusChange: (admin: Admin, nextStatus: AdminStatus) => void;
};

export type AdminPageProps = {
  items: Admin[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: AdminSortOption;
  error?: string | null;
  canChangeStatus: boolean;
};

export type AdminFormModalProps = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export type AdminDetailsContentProps = {
  details: Admin | null;
  error?: string | null;
};

export type AdminDetailsModalShellProps = {
  children: ReactNode;
};

export type AdminServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: AdminSortOption;
};

export type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};
