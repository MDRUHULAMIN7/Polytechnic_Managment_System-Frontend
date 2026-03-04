import { Suspense } from "react";
import type { Metadata } from "next";
import { InstructorPageServer } from "@/components/dashboard/admin/instructor/instructor-server";
import type { InstructorSortOption } from "@/lib/type/dashboard/admin/instructor";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
export const metadata: Metadata = {
  title: "Instructors",
};




function parseSortParam(value: string): InstructorSortOption {
  if (value === "createdAt") {
    return value;
  }

  return "-createdAt";
}

export default async function InstructorsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const academicDepartment = readParam(resolvedSearchParams, "academicDepartment");

  return (
    <Suspense fallback={<TableSkeleton />}>
      <InstructorPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        academicDepartment={academicDepartment}
      />
    </Suspense>
  );
}
