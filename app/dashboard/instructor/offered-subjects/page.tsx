import { Suspense } from "react";
import type { Metadata } from "next";
import { OfferedSubjectPageServer } from "@/components/dashboard/instructor/offered-subject/offered-subject-server";
import type {
  OfferedSubjectScopeOption,
  OfferedSubjectSortOption,
} from "@/lib/type/dashboard/admin/offered-subject";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export const metadata: Metadata = {
  title: "Offered Subjects",
};

function parseSortParam(value: string): OfferedSubjectSortOption {
  if (value === "createdAt" || value === "-createdAt") {
    return value;
  }
  return "-createdAt";
}

function parseScopeParam(value: string): OfferedSubjectScopeOption {
  if (value === "my") {
    return value;
  }

  return "all";
}

export default async function OfferedSubjectsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const scope = parseScopeParam(readParam(resolvedSearchParams, "scope"));

  return (
    <Suspense fallback={<TableSkeleton/>}>
      <OfferedSubjectPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        scope={scope}
      />
    </Suspense>
  );
}
