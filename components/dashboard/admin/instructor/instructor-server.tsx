import { cookies } from "next/headers";
import { getAcademicDepartmentsServer } from "@/lib/api/dashboard/admin/academic-department/server";
import { getInstructorsServer } from "@/lib/api/dashboard/admin/instructor/server";
import type { Instructor, PaginationMeta } from "@/lib/type/dashboard/admin/instructor";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { InstructorServerProps } from "@/lib/type/dashboard/admin/instructor/ui";
import { InstructorPage } from "./instructor-page";

export async function InstructorPageServer({
  searchTerm,
  page,
  limit,
  sort,
  academicDepartment,
}: InstructorServerProps) {
  const cookieStore = await cookies();
  const role = cookieStore.get("pms_role")?.value;
  const canChangeStatus = role === "superAdmin";
  const listFields = "id,name,email,designation,academicDepartment,user";

  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: Instructor[] = [];
  let meta = fallbackMeta;
  let departments: AcademicDepartment[] = [];

  const [instructorsResult, departmentsResult] = await Promise.allSettled([
    getInstructorsServer({
      searchTerm,
      page,
      limit,
      sort,
      academicDepartment: academicDepartment || undefined,
      fields: listFields,
    }),
    getAcademicDepartmentsServer({
      page: 1,
      limit: 50,
      sort: "name",
    }),
  ]);

  if (instructorsResult.status === "fulfilled") {
    items = instructorsResult.value.result ?? [];
    meta = instructorsResult.value.meta ?? fallbackMeta;
  } else {
    error =
      instructorsResult.reason instanceof Error
        ? instructorsResult.reason.message
        : "Failed to load.";
  }

  if (departmentsResult.status === "fulfilled") {
    departments = departmentsResult.value.result ?? [];
  }

  return (
    <InstructorPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      academicDepartment={academicDepartment}
      departments={departments}
      canChangeStatus={canChangeStatus}
      error={error}
    />
  );
}
