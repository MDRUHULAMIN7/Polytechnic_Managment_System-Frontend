import { Suspense } from "react";
import type { Metadata } from "next";
import { AcademicSemesterPageServer } from "@/components/dashboard/admin/academic-semester/academic-semester-server";
import { AcademicSemesterPageSkeleton } from "@/components/dashboard/admin/academic-semester/academic-semester-skeleton";
import type {
  AcademicSemesterName,
  AcademicSemesterSortOption,
} from "@/lib/type/dashboard/admin/academic-semester";
import { ACADEMIC_SEMESTER_NAMES } from "@/lib/type/dashboard/admin/academic-semester/constants";

export const metadata: Metadata = {
  title: "Academic Semesters",
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

function parseSortParam(value: string): AcademicSemesterSortOption {
  if (value === "createdAt" || value === "name" || value === "-name") {
    return value;
  }

  return "-createdAt";
}

function parseNameParam(value: string): AcademicSemesterName | "" {
  if (!value) {
    return "";
  }

  if ((ACADEMIC_SEMESTER_NAMES as string[]).includes(value)) {
    return value as AcademicSemesterName;
  }

  return "";
}

export default async function AcademicSemestersPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const name = parseNameParam(readParam(resolvedSearchParams, "name"));

  return (
    <Suspense fallback={<AcademicSemesterPageSkeleton />}>
      <AcademicSemesterPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        name={name}
      />
    </Suspense>
  );
}
