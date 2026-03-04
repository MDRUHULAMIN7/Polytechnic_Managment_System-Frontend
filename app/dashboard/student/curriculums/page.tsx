import { Suspense } from "react";
import type { Metadata } from "next";
import { CurriculumPageServer } from "@/components/dashboard/student/curriculum/curriculum-server";
import type { CurriculumSortOption } from "@/lib/type/dashboard/admin/curriculum";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export const metadata: Metadata = {
  title: "Curriculums",
};

function parseSortParam(value: string): CurriculumSortOption {
  if (value === "createdAt" || value === "-createdAt" || value === "session" || value === "-session") {
    return value;
  }
  return "-createdAt";
}

export default async function CurriculumsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));

  return (
    <Suspense fallback={<TableSkeleton />}>
      <CurriculumPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
      />
    </Suspense>
  );
}
