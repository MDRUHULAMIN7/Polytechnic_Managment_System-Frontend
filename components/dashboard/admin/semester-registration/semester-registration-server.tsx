import { getAcademicSemestersServer } from "@/lib/api/dashboard/admin/academic-semester/server";
import { getSemesterRegistrationsServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import type { PaginationMeta } from "@/lib/type/dashboard/admin/semester-registration";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { SemesterRegistrationServerProps } from "@/lib/type/dashboard/admin/semester-registration/ui";
import { SemesterRegistrationPage } from "./semester-registration-page";

export async function SemesterRegistrationPageServer({
  searchTerm,
  page,
  limit,
  sort,
  status,
  shift,
}: SemesterRegistrationServerProps) {
  const fallbackMeta: PaginationMeta = {
    page,
    limit,
    total: 0,
    totalPage: 1,
  };

  let error: string | null = null;
  let items = [];
  let meta = fallbackMeta;
  let semesters: AcademicSemester[] = [];

  const [registrationsResult, semestersResult] = await Promise.allSettled([
    getSemesterRegistrationsServer({
      searchTerm,
      page,
      limit,
      sort,
      status: status || undefined,
      shift: shift || undefined,
    }),
    getAcademicSemestersServer({ page: 1, limit: 1000, sort: "name" }),
  ]);

  if (registrationsResult.status === "fulfilled") {
    items = registrationsResult.value.result ?? [];
    meta = registrationsResult.value.meta ?? fallbackMeta;
  } else {
    error =
      registrationsResult.reason instanceof Error
        ? registrationsResult.reason.message
        : "Failed to load.";
  }

  if (semestersResult.status === "fulfilled") {
    semesters = semestersResult.value.result ?? [];
  }

  return (
    <SemesterRegistrationPage
      items={items}
      meta={meta}
      searchTerm={searchTerm}
      page={page}
      limit={limit}
      sort={sort}
      status={status}
      shift={shift}
      semesters={semesters}
      error={error}
    />
  );
}
