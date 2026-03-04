import { Suspense } from "react";
import type { Metadata } from "next";
import { AcademicDepartmentPageServer } from "@/components/dashboard/admin/academic-department/academic-department-server";

import type { AcademicDepartmentSortOption } from "@/lib/type/dashboard/admin/academic-department";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { SearchParamBag } from "@/lib/type/dashboard/admin/type";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export const metadata: Metadata = {
  title: "Academic Departments",
};



type MaybePromise<T> = T | Promise<T>;

type PageProps = {
  searchParams?: MaybePromise<SearchParamBag>;
};

 export function parseSortParam(value: string): AcademicDepartmentSortOption {
  if (value === "createdAt" || value === "name" || value === "-name") {
    return value;
  }

  return "-createdAt";
}

export default async function AcademicDepartmentsPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const academicInstructor = readParam(
    resolvedSearchParams,
    "academicInstructor"
  );

  return (
    <Suspense fallback={<TableSkeleton />}>
      <AcademicDepartmentPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        academicInstructor={academicInstructor}
      />
    </Suspense>
  );
}
