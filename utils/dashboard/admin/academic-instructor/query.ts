import type { AcademicInstructorListParams } from "@/lib/type/dashboard/admin/academic-instructor";

export function buildAcademicInstructorQuery(
  params: AcademicInstructorListParams
) {
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

  return searchParams;
}
