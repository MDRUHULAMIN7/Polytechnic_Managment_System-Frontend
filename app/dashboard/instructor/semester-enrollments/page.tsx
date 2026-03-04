import { Suspense } from "react";
import type { Metadata } from "next";
import { SemesterEnrollmentPageServer } from "@/components/dashboard/instructor/semester-enrollment/semester-enrollment-server";
import { SemesterEnrollmentPageSkeleton } from "@/components/dashboard/admin/semester-enrollment/semester-enrollment-skeleton";
import type { SemesterEnrollmentSortOption, SemesterEnrollmentStatus } from "@/lib/type/dashboard/admin/semester-enrollment";
import { SEMESTER_ENROLLMENT_STATUSES } from "@/lib/type/dashboard/admin/semester-enrollment/constants";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { PageProps } from "@/lib/type/dashboard/admin/type";

export const metadata: Metadata = {
  title: "Semester Enrollments",
};

function parseSortParam(value: string): SemesterEnrollmentSortOption {
  if (value === "createdAt" || value === "-createdAt") {
    return value;
  }
  return "-createdAt";
}

function parseStatusParam(value: string): SemesterEnrollmentStatus | "" {
  if ((SEMESTER_ENROLLMENT_STATUSES as string[]).includes(value)) {
    return value as SemesterEnrollmentStatus;
  }
  return "";
}

export default async function SemesterEnrollmentsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const status = parseStatusParam(readParam(resolvedSearchParams, "status"));

  return (
    <Suspense fallback={<SemesterEnrollmentPageSkeleton />}>
      <SemesterEnrollmentPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        status={status}
      />
    </Suspense>
  );
}
