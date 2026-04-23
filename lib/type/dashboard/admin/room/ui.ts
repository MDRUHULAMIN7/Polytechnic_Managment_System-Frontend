import type { ReactNode } from "react";
import type { PaginationMeta, Room, RoomSortOption } from "./index";

export type RoomFiltersProps = {
  search: string;
  sort: RoomSortOption;
  isActive: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: RoomSortOption) => void;
  onActiveChange: (value: string) => void;
};

export type RoomPaginationProps = {
  meta: PaginationMeta;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export type RoomTableProps = {
  items: Room[];
  loading: boolean;
  error?: string | null;
  onEdit: (item: Room) => void;
};

export type RoomPageProps = {
  items: Room[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: RoomSortOption;
  isActive: string;
  error?: string | null;
};

export type RoomFormMode = "create" | "edit";

export type RoomFormModalProps = {
  open: boolean;
  mode: RoomFormMode;
  room?: Room | null;
  onClose: () => void;
  onSaved: () => void;
};

export type RoomServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: RoomSortOption;
  isActive: string;
};

export type RoomModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};
