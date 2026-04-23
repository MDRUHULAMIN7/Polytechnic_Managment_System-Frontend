export type PeriodConfigItem = {
  periodNo: number;
  title?: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isBreak?: boolean;
  isActive?: boolean;
};

export type PeriodConfig = {
  _id: string;
  label: string;
  effectiveFrom: string;
  isActive: boolean;
  periods: PeriodConfigItem[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PeriodConfigSortOption =
  | "-createdAt"
  | "createdAt"
  | "-effectiveFrom"
  | "effectiveFrom";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type PeriodConfigListPayload = {
  meta: PaginationMeta;
  result: PeriodConfig[];
};

export type PeriodConfigListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: PeriodConfigSortOption;
  isActive?: string;
};

export type PeriodConfigInput = {
  label: string;
  effectiveFrom: string;
  isActive?: boolean;
  periods: PeriodConfigItem[];
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
