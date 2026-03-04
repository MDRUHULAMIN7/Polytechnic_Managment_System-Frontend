import { Suspense } from "react";
import type { Metadata } from "next";
import { AcademicInstructorPageServer } from "@/components/dashboard/admin/academic-instructor/academic-instructor-server";
import type { AcademicInstructorSortOption } from "@/lib/type/dashboard/admin/academic-instructor";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export const metadata: Metadata = {
  title: "Academic Instructors",
};






function parseSortParam(value: string): AcademicInstructorSortOption {
  if (value === "createdAt" || value === "name" || value === "-name") {
    return value;
  }

  return "-createdAt";
}

export default async function AcademicInstructorsPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));

  return (
    <Suspense fallback={<TableSkeleton />}>
      <AcademicInstructorPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
      />
    </Suspense>
  );
}
