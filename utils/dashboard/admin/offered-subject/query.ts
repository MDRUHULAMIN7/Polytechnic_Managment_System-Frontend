import type { OfferedSubjectListParams } from "@/lib/type/dashboard/admin/offered-subject";

export function buildOfferedSubjectQuery(params: OfferedSubjectListParams) {
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

  if (params.scope === "my") {
    searchParams.set("scope", params.scope);
  }

  if (params.semesterRegistration) {
    searchParams.set("semesterRegistration", params.semesterRegistration);
  }

  if (params.academicDepartment) {
    searchParams.set("academicDepartment", params.academicDepartment);
  }

  if (params.academicInstructor) {
    searchParams.set("academicInstructor", params.academicInstructor);
  }

  if (params.subject) {
    searchParams.set("subject", params.subject);
  }

  if (params.instructor) {
    searchParams.set("instructor", params.instructor);
  }

  if (params.fields) {
    searchParams.set("fields", params.fields);
  }

  return searchParams;
}
