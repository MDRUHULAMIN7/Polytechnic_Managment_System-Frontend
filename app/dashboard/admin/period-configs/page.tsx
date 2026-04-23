import { Suspense } from "react";
import type { Metadata } from "next";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { PeriodConfigPageServer } from "@/components/dashboard/admin/period-config/period-config-server";
import type { PageProps } from "@/lib/type/dashboard/admin/type";
import type { PeriodConfigSortOption } from "@/lib/type/dashboard/admin/period-config";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";

export const metadata: Metadata = {
  title: "Period Configs",
};

function parseSortParam(value: string): PeriodConfigSortOption {
  if (
    value === "createdAt" ||
    value === "-createdAt" ||
    value === "effectiveFrom" ||
    value === "-effectiveFrom"
  ) {
    return value;
  }

  return "-effectiveFrom";
}

export default async function PeriodConfigsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const isActive = readParam(resolvedSearchParams, "isActive");

  return (
    <Suspense fallback={<TableSkeleton />}>
      <PeriodConfigPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        isActive={isActive}
      />
    </Suspense>
  );
}
