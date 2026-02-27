import type { AdminListParams } from "@/lib/type/dashboard/admin/admin";

export function buildAdminQuery(params: AdminListParams) {
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

  if (params.fields) {
    searchParams.set("fields", params.fields);
  }

  return searchParams;
}
