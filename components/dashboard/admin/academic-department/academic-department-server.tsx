import { getAcademicDepartmentsServer } from "@/lib/api/dashboard/admin/academic-department/server";
import { getAcademicInstructorsServer } from "@/lib/api/dashboard/admin/academic-instructor/server";
import type { PaginationMeta } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { AcademicDepartmentServerProps } from "@/lib/type/dashboard/admin/academic-department/ui";
import { AcademicDepartmentPage } from "./academic-department-page";

export async function AcademicDepartmentPageServer({
  searchTerm,
  page,
  limit,
  sort,
  academicInstructor,
}: AcademicDepartmentServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items = [];
  let meta = fallbackMeta;
  let instructors: AcademicInstructor[] = [];

  const [departmentsResult, instructorsResult] = await Promise.allSettled([
    getAcademicDepartmentsServer({
      searchTerm,
      page,
      limit,
      sort,
      academicInstructor: academicInstructor || undefined,
    }),
    getAcademicInstructorsServer({
      page: 1,
      limit: 1000,
      sort: "name",
    }),
  ]);

  if (departmentsResult.status === "fulfilled") {
    items = departmentsResult.value.result ?? [];
    meta = departmentsResult.value.meta ?? fallbackMeta;
  } else {
    error =
      departmentsResult.reason instanceof Error
        ? departmentsResult.reason.message
        : "Failed to load.";
  }

  if (instructorsResult.status === "fulfilled") {
    instructors = instructorsResult.value.result ?? [];
  }

  return (
    <AcademicDepartmentPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      academicInstructor={academicInstructor}
      instructors={instructors}
      error={error}
    />
  );
}
