import { cookies } from "next/headers";
import { getAcademicDepartmentsServer } from "@/lib/api/dashboard/admin/academic-department/server";
import { getAcademicSemestersServer } from "@/lib/api/dashboard/admin/academic-semester/server";
import { getStudentsServer } from "@/lib/api/dashboard/admin/student/server";
import type { PaginationMeta, Student } from "@/lib/type/dashboard/admin/student";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { StudentServerProps } from "@/lib/type/dashboard/admin/student/ui";
import { StudentPage } from "./student-page";

export async function StudentPageServer({
  searchTerm,
  page,
  limit,
  sort,
  academicDepartment,
  admissionSemester,
}: StudentServerProps) {
  const cookieStore = await cookies();
  const role = cookieStore.get("pms_role")?.value;
  const canChangeStatus = role === "superAdmin";
  const listFields = "id,name,email,academicDepartment,admissionSemester,user";

  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: Student[] = [];
  let meta = fallbackMeta;
  let departments: AcademicDepartment[] = [];
  let semesters: AcademicSemester[] = [];

  const [studentsResult, departmentsResult, semestersResult] = await Promise.allSettled([
    getStudentsServer({
      searchTerm,
      page,
      limit,
      sort,
      academicDepartment: academicDepartment || undefined,
      admissionSemester: admissionSemester || undefined,
      fields: listFields,
    }),
    getAcademicDepartmentsServer({
      page: 1,
      limit: 1000,
      sort: "name",
    }),
    getAcademicSemestersServer({
      page: 1,
      limit: 1000,
      sort: "name",
    }),
  ]);

  if (studentsResult.status === "fulfilled") {
    items = studentsResult.value.result ?? [];
    meta = studentsResult.value.meta ?? fallbackMeta;
  } else {
    error =
      studentsResult.reason instanceof Error
        ? studentsResult.reason.message
        : "Failed to load.";
  }

  if (departmentsResult.status === "fulfilled") {
    departments = departmentsResult.value.result ?? [];
  }

  if (semestersResult.status === "fulfilled") {
    semesters = semestersResult.value.result ?? [];
  }

  return (
    <StudentPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      academicDepartment={academicDepartment}
      admissionSemester={admissionSemester}
      departments={departments}
      semesters={semesters}
      canChangeStatus={canChangeStatus}
      error={error}
    />
  );
}
