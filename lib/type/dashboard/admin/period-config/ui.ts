import type { ReactNode } from "react";
import type {
  PaginationMeta,
  PeriodConfig,
  PeriodConfigInput,
  PeriodConfigSortOption,
} from "./index";

export type PeriodConfigFiltersProps = {
  search: string;
  sort: PeriodConfigSortOption;
  isActive: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: PeriodConfigSortOption) => void;
  onActiveChange: (value: string) => void;
};

export type PeriodConfigPageProps = {
  items: PeriodConfig[];
  meta: PaginationMeta;
  searchTerm: string;
  page: number;
  limit: number;
  sort: PeriodConfigSortOption;
  isActive: string;
  canManage: boolean;
  error?: string | null;
};

export type PeriodConfigServerProps = {
  searchTerm: string;
  page: number;
  limit: number;
  sort: PeriodConfigSortOption;
  isActive: string;
};

export type PeriodConfigFormMode = "create" | "edit";

export type PeriodConfigFormState = {
  label: string;
  effectiveFrom: string;
  isActive: boolean;
  periods: Array<{
    id: string;
    periodNo: string;
    title: string;
    startTime: string;
    endTime: string;
    durationMinutes: string;
    isBreak: boolean;
    isActive: boolean;
  }>;
};

export type PeriodConfigFormModalProps = {
  open: boolean;
  mode: PeriodConfigFormMode;
  periodConfig?: PeriodConfig | null;
  onClose: () => void;
  onSaved: () => void;
};

export type PeriodConfigListProps = {
  items: PeriodConfig[];
  loading: boolean;
  canManage: boolean;
  error?: string | null;
  onEdit: (item: PeriodConfig) => void;
};

export type PeriodConfigModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
};

export type PeriodConfigInputPayload = PeriodConfigInput;
