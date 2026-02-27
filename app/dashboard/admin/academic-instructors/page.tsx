import { Suspense } from "react";
import type { Metadata } from "next";
import { AcademicInstructorPageServer } from "@/components/dashboard/admin/academic-instructor/academic-instructor-server";
import { AcademicInstructorPageSkeleton } from "@/components/dashboard/admin/academic-instructor/academic-instructor-skeleton";
import type { AcademicInstructorSortOption } from "@/lib/type/dashboard/admin/academic-instructor";

export const metadata: Metadata = {
  title: "Academic Instructors",
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
    <Suspense fallback={<AcademicInstructorPageSkeleton />}>
      <AcademicInstructorPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
      />
    </Suspense>
  );
}
