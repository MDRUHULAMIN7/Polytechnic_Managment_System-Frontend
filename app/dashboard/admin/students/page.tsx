import { Suspense } from "react";
import type { Metadata } from "next";
import { StudentPageServer } from "@/components/dashboard/admin/student/student-server";
import type { StudentSortOption } from "@/lib/type/dashboard/admin/student";
import { PageProps } from "@/lib/type/dashboard/admin/type";
import { parseNumberParam, readParam } from "@/utils/dashboard/admin/utils";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";
export const metadata: Metadata = {
  title: "Students",
};

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
    <Suspense fallback={<TableSkeleton />}>
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
