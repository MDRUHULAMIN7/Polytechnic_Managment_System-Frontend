import type { CurriculumListParams } from "@/lib/type/dashboard/admin/curriculum";

export function buildCurriculumQuery(params: CurriculumListParams) {
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

  if (params.academicSemester) {
    searchParams.set("academicSemester", params.academicSemester);
  }

  if (params.semisterRegistration) {
    searchParams.set("semisterRegistration", params.semisterRegistration);
  }

  if (params.fields) {
    searchParams.set("fields", params.fields);
  }

  return searchParams;
}
