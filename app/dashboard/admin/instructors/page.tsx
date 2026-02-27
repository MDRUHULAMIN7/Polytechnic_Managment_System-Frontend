import { Suspense } from "react";
import type { Metadata } from "next";
import { InstructorPageServer } from "@/components/dashboard/admin/instructor/instructor-server";
import { InstructorPageSkeleton } from "@/components/dashboard/admin/instructor/instructor-skeleton";
import type { InstructorSortOption } from "@/lib/type/dashboard/admin/instructor";

export const metadata: Metadata = {
  title: "Instructors",
};

type SearchParamBag =
  | Record<string, string | string[] | undefined>
  | URLSearchParams
  | undefined;

type MaybePromise<T> = T | Promise<T>;

type PageProps = {
  searchParams?: MaybePromise<SearchParamBag>;
};

function readParam(searchParams: SearchParamBag, key: string) {
  if (!searchParams) {
    return "";
  }

  if (typeof (searchParams as URLSearchParams).get === "function") {
    return (searchParams as URLSearchParams).get(key) ?? "";
  }

  const value = (searchParams as Record<string, string | string[] | undefined>)[
    key
  ];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function parseNumberParam(value: string, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

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
    <Suspense fallback={<InstructorPageSkeleton />}>
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
