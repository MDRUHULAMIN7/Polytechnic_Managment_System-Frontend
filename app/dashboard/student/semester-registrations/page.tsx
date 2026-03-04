import { Suspense } from "react";
import type { Metadata } from "next";
import { SemesterRegistrationPageServer } from "@/components/dashboard/student/semester-registration/semester-registration-server";
import type {
  SemesterRegistrationShift,
  SemesterRegistrationSortOption,
  SemesterRegistrationStatus,
} from "@/lib/type/dashboard/admin/semester-registration";
import {
  SEMESTER_REGISTRATION_SHIFTS,
  SEMESTER_REGISTRATION_STATUSES,
} from "@/lib/type/dashboard/admin/semester-registration/constants";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export const metadata: Metadata = {
  title: "Semester Registrations",
};

function parseSortParam(value: string): SemesterRegistrationSortOption {
  if (
    value === "createdAt" ||
    value === "-createdAt" ||
    value === "startDate" ||
    value === "-startDate" ||
    value === "endDate" ||
    value === "-endDate"
  ) {
    return value;
  }

  return "-createdAt";
}

function parseStatusParam(value: string): SemesterRegistrationStatus | "" {
  if ((SEMESTER_REGISTRATION_STATUSES as string[]).includes(value)) {
    return value as SemesterRegistrationStatus;
  }
  return "";
}

function parseShiftParam(value: string): SemesterRegistrationShift | "" {
  if ((SEMESTER_REGISTRATION_SHIFTS as string[]).includes(value)) {
    return value as SemesterRegistrationShift;
  }
  return "";
}

export default async function SemesterRegistrationsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const searchTerm = readParam(resolvedSearchParams, "searchTerm");
  const page = parseNumberParam(readParam(resolvedSearchParams, "page"), 1);
  const limit = parseNumberParam(readParam(resolvedSearchParams, "limit"), 10);
  const sort = parseSortParam(readParam(resolvedSearchParams, "sort"));
  const status = parseStatusParam(readParam(resolvedSearchParams, "status"));
  const shift = parseShiftParam(readParam(resolvedSearchParams, "shift"));

  return (
    <Suspense fallback={<TableSkeleton />}>
      <SemesterRegistrationPageServer
        searchTerm={searchTerm}
        page={page}
        limit={limit}
        sort={sort}
        status={status}
        shift={shift}
      />
    </Suspense>
  );
}
