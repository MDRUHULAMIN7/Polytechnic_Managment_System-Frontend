import type { InstructorListParams } from "@/lib/type/dashboard/admin/instructor";

export function buildInstructorQuery(params: InstructorListParams) {
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

  if (params.academicDepartment) {
    searchParams.set("academicDepartment", params.academicDepartment);
  }

  if (params.fields) {
    searchParams.set("fields", params.fields);
  }

  return searchParams;
}
