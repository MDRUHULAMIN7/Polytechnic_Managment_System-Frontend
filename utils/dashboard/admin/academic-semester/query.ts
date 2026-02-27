import type { AcademicSemesterListParams } from "@/lib/type/dashboard/admin/academic-semester";

export function buildAcademicSemesterQuery(params: AcademicSemesterListParams) {
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

  if (params.name) {
    searchParams.set("name", params.name);
  }

  return searchParams;
}
