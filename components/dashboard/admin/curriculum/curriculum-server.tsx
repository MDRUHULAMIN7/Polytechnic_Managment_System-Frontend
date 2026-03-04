import { getAcademicDepartmentsServer } from "@/lib/api/dashboard/admin/academic-department/server";
import { getSemesterRegistrationsServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import { getSubjectsServer } from "@/lib/api/dashboard/admin/subject/server";
import { getOfferedSubjectsServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import { getCurriculumsServer } from "@/lib/api/dashboard/admin/curriculum/server";
import type { Curriculum, PaginationMeta } from "@/lib/type/dashboard/admin/curriculum";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type { CurriculumServerProps } from "@/lib/type/dashboard/admin/curriculum/ui";
import { CurriculumPage } from "./curriculum-page";

export async function CurriculumPageServer({
  searchTerm,
  page,
  limit,
  sort,
}: CurriculumServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: Curriculum[] = [];
  let meta = fallbackMeta;
  let academicDepartments: AcademicDepartment[] = [];
  let semesterRegistrations: SemesterRegistration[] = [];
  let subjects: Subject[] = [];
  let offeredSubjects: OfferedSubject[] = [];

  const [
    curriculumsResult,
    departmentsResult,
    registrationsResult,
    subjectsResult,
    offeredSubjectsResult,
  ] =
    await Promise.allSettled([
      getCurriculumsServer({ searchTerm, page, limit, sort }),
      getAcademicDepartmentsServer({ page: 1, limit: 1000, sort: "name" }),
      getSemesterRegistrationsServer({ page: 1, limit: 1000, sort: "-createdAt" }),
      getSubjectsServer({ page: 1, limit: 1000 }),
      getOfferedSubjectsServer({ page: 1, limit: 1000, sort: "-createdAt" }),
    ]);

  if (curriculumsResult.status === "fulfilled") {
    items = curriculumsResult.value.result ?? [];
    meta = curriculumsResult.value.meta ?? fallbackMeta;
  } else {
    error =
      curriculumsResult.reason instanceof Error
        ? curriculumsResult.reason.message
        : "Failed to load.";
  }

  if (departmentsResult.status === "fulfilled") {
    academicDepartments = departmentsResult.value.result ?? [];
  }
  if (registrationsResult.status === "fulfilled") {
    semesterRegistrations = registrationsResult.value.result ?? [];
  }
  if (subjectsResult.status === "fulfilled") {
    subjects = subjectsResult.value.result ?? [];
  }
  if (offeredSubjectsResult.status === "fulfilled") {
    offeredSubjects = offeredSubjectsResult.value.result ?? [];
  }

  return (
    <CurriculumPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      academicDepartments={academicDepartments}
      semesterRegistrations={semesterRegistrations}
      subjects={subjects}
      offeredSubjects={offeredSubjects}
      error={error}
    />
  );
}
