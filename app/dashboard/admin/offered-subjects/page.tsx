import { Suspense } from "react";
import type { Metadata } from "next";
import { OfferedSubjectPageServer } from "@/components/dashboard/admin/offered-subject/offered-subject-server";
import { OfferedSubjectPageSkeleton } from "@/components/dashboard/admin/offered-subject/offered-subject-skeleton";
import type { OfferedSubjectSortOption } from "@/lib/type/dashboard/admin/offered-subject";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { PageProps } from "@/lib/type/dashboard/admin/type";

export const metadata: Metadata = {
  title: "Offered Subjects",
};

function parseSortParam(value: string): OfferedSubjectSortOption {
  if (value === "createdAt" || value === "-createdAt") {
    return value;
  }
  return "-createdAt";
}

export default async function OfferedSubjectsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));

  return (
    <Suspense fallback={<OfferedSubjectPageSkeleton />}>
      <OfferedSubjectPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
      />
    </Suspense>
  );
}
