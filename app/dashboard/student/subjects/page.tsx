import { Suspense } from "react";
import type { Metadata } from "next";
import { SubjectPageServer } from "@/components/dashboard/student/subject/subject-server";
import type { SubjectSortOption } from "@/lib/type/dashboard/admin/subject";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export const metadata: Metadata = {
  title: "Subjects",
};

function parseSortParam(value: string): SubjectSortOption {
  if (value === "title" || value === "code" || value === "-code") {
    return value;
  }
  return "-title";
}

export default async function SubjectsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));

  return (
    <Suspense fallback={<TableSkeleton />}>
      <SubjectPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
      />
    </Suspense>
  );
}
