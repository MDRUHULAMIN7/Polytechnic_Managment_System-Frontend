import { Suspense } from "react";
import type { Metadata } from "next";
import { StudentPageServer } from "@/components/dashboard/admin/student/student-server";
import { StudentPageSkeleton } from "@/components/dashboard/admin/student/student-skeleton";
import type { StudentSortOption } from "@/lib/type/dashboard/admin/student";

export const metadata: Metadata = {
  title: "Students",
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

function parseSortParam(value: string): StudentSortOption {
  if (
    value === "createdAt" ||
    value === "name.firstName" ||
    value === "-name.firstName" ||
    value === "email" ||
    value === "-email"
  ) {
    return value;
  }

  return "-createdAt";
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const academicDepartment = readParam(resolvedSearchParams, "academicDepartment");
  const admissionSemester = readParam(resolvedSearchParams, "admissionSemester");

  return (
    <Suspense fallback={<StudentPageSkeleton />}>
      <StudentPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        academicDepartment={academicDepartment}
        admissionSemester={admissionSemester}
      />
    </Suspense>
  );
}
