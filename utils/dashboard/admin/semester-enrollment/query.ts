import type { SemesterEnrollmentListParams } from "@/lib/type/dashboard/admin/semester-enrollment";

export function buildSemesterEnrollmentQuery(params: SemesterEnrollmentListParams) {
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

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.fields) {
    searchParams.set("fields", params.fields);
  }

  return searchParams;
}
