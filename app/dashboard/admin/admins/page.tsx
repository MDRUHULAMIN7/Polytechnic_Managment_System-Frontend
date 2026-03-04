import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminPageServer } from "@/components/dashboard/admin/admin/admin-server";
import type { AdminSortOption } from "@/lib/type/dashboard/admin/admin";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export const metadata: Metadata = {
  title: "Admins",
};


function parseSortParam(value: string): AdminSortOption {
  if (value === "createdAt") {
    return value;
  }

  return "-createdAt";
}

export default async function AdminsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));

  return (
    <Suspense fallback={<TableSkeleton />}>
      <AdminPageServer searchTerm={searchTerm} page={page} limit={limit} sort={sort} />
    </Suspense>
  );
}
