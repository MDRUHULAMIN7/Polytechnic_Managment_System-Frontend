import { Suspense } from "react";
import type { Metadata } from "next";
import { AcademicSemesterPageServer } from "@/components/dashboard/instructor/academic-semester/academic-semester-server";
import { AcademicSemesterPageSkeleton } from "@/components/dashboard/admin/academic-semester/academic-semester-skeleton";
import type {
  AcademicSemesterName,
  AcademicSemesterSortOption,
} from "@/lib/type/dashboard/admin/academic-semester";
import { ACADEMIC_SEMESTER_NAMES } from "@/lib/type/dashboard/admin/academic-semester/constants";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { PageProps } from "@/lib/type/dashboard/admin/type";

export const metadata: Metadata = {
  title: "Academic Semesters",
};

function parseSortParam(value: string): AcademicSemesterSortOption {
  if (value === "createdAt" || value === "name" || value === "-name") {
    return value;
  }

  return "-createdAt";
}

function parseNameParam(value: string): AcademicSemesterName | "" {
  if (!value) {
    return "";
  }

  if ((ACADEMIC_SEMESTER_NAMES as string[]).includes(value)) {
    return value as AcademicSemesterName;
  }

  return "";
}

export default async function AcademicSemestersPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const name = parseNameParam(readParam(resolvedSearchParams, "name"));

  return (
    <Suspense fallback={<AcademicSemesterPageSkeleton />}>
      <AcademicSemesterPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        name={name}
      />
    </Suspense>
  );
}
