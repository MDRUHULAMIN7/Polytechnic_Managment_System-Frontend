import { getAcademicDepartmentsServer } from "@/lib/api/dashboard/admin/academic-department/server";
import { getAcademicInstructorsServer } from "@/lib/api/dashboard/admin/academic-instructor/server";
import { getInstructorsServer } from "@/lib/api/dashboard/admin/instructor/server";
import { getSemesterRegistrationsServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import { getSubjectsServer } from "@/lib/api/dashboard/admin/subject/server";
import { getOfferedSubjectsServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import type { OfferedSubject, PaginationMeta } from "@/lib/type/dashboard/admin/offered-subject";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { OfferedSubjectServerProps } from "@/lib/type/dashboard/admin/offered-subject/ui";
import { OfferedSubjectPage } from "./offered-subject-page";

const OFFERED_SUBJECT_TABLE_FIELDS =
  "subject,instructor,academicSemester,maxCapacity";

export async function OfferedSubjectPageServer({
  searchTerm,
  page,
  limit,
  sort,
}: OfferedSubjectServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items: OfferedSubject[] = [];
  let meta = fallbackMeta;
  let subjects: Subject[] = [];
  let instructors: Instructor[] = [];
  let academicDepartments: AcademicDepartment[] = [];
  let academicInstructors: AcademicInstructor[] = [];
  let semesterRegistrations: SemesterRegistration[] = [];

  const [
    offeredResult,
    subjectsResult,
    instructorsResult,
    departmentsResult,
    academicInstructorsResult,
    registrationsResult,
  ] = await Promise.allSettled([
    getOfferedSubjectsServer({
      searchTerm,
      page,
      limit,
      sort,
      fields: OFFERED_SUBJECT_TABLE_FIELDS,
    }),
    getSubjectsServer({ page: 1, limit: 50, fields: "title" }),
    getInstructorsServer({
      page: 1,
      limit: 50,
      sort: "-createdAt",
      fields: "name,designation,academicInstructor,academicDepartment",
    }),
    getAcademicDepartmentsServer({ page: 1, limit: 50, sort: "name" }),
    getAcademicInstructorsServer({ page: 1, limit: 50, sort: "name" }),
    getSemesterRegistrationsServer({ page: 1, limit: 200, sort: "-createdAt" }),
  ]);

  if (offeredResult.status === "fulfilled") {
    items = offeredResult.value.result ?? [];
    meta = offeredResult.value.meta ?? fallbackMeta;
  } else {
    error =
      offeredResult.reason instanceof Error
        ? offeredResult.reason.message
        : "Failed to load.";
  }

  if (subjectsResult.status === "fulfilled") {
    subjects = subjectsResult.value.result ?? [];
  }
  if (instructorsResult.status === "fulfilled") {
    instructors = instructorsResult.value.result ?? [];
  }
  if (departmentsResult.status === "fulfilled") {
    academicDepartments = departmentsResult.value.result ?? [];
  }
  if (academicInstructorsResult.status === "fulfilled") {
    academicInstructors = academicInstructorsResult.value.result ?? [];
  }
  if (registrationsResult.status === "fulfilled") {
    semesterRegistrations = registrationsResult.value.result ?? [];
  }

  return (
    <OfferedSubjectPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      subjects={subjects}
      instructors={instructors}
      academicDepartments={academicDepartments}
      academicInstructors={academicInstructors}
      semesterRegistrations={semesterRegistrations}
      error={error}
    />
  );
}
