import { Suspense } from "react";
import type { Metadata } from "next";
import { EnrolledSubjectPageServer } from "@/components/dashboard/student/enrolled-subject/enrolled-subject-server";
import { TableSkeleton } from "@/components/dashboard/TableSkeleton";

export const metadata: Metadata = {
  title: "Enrolled Subjects",
};

export default function EnrolledSubjectsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <EnrolledSubjectPageServer />
    </Suspense>
  );
}
