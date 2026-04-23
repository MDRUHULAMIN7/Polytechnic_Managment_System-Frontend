import type { PeriodConfigListParams } from "@/lib/type/dashboard/admin/period-config";

export function buildPeriodConfigQuery(params: PeriodConfigListParams) {
  const searchParams = new URLSearchParams();

  if (params.searchTerm?.trim()) {
    searchParams.set("searchTerm", params.searchTerm.trim());
  }
  if (params.page) {
    searchParams.set("page", String(params.page));
  }
  if (params.limit) {
    searchParams.set("limit", String(params.limit));
  }
  if (params.sort) {
    searchParams.set("sort", params.sort);
  }
  if (params.isActive) {
    searchParams.set("isActive", params.isActive);
  }

  return searchParams;
}
