import { Suspense } from "react";
import type { Metadata } from "next";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
import { RoomPageServer } from "@/components/dashboard/admin/room/room-server";
import type { PageProps } from "@/lib/type/dashboard/admin/type";
import type { RoomSortOption } from "@/lib/type/dashboard/admin/room";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";

export const metadata: Metadata = {
  title: "Rooms",
};

function parseSortParam(value: string): RoomSortOption {
  if (
    value === "createdAt" ||
    value === "-createdAt" ||
    value === "roomName" ||
    value === "-roomName" ||
    value === "buildingNumber" ||
    value === "-buildingNumber"
  ) {
    return value;
  }

  return "-createdAt";
}

export default async function RoomsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const isActive = readParam(resolvedSearchParams, "isActive");

  return (
    <Suspense fallback={<TableSkeleton />}>
      <RoomPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        isActive={isActive}
      />
    </Suspense>
  );
}
