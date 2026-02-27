import type { AcademicDepartmentListParams } from "@/lib/type/dashboard/admin/academic-department";

export function buildAcademicDepartmentQuery(
  params: AcademicDepartmentListParams
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

  if (params.academicInstructor) {
    searchParams.set("academicInstructor", params.academicInstructor);
  }

  return searchParams;
}
