import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getStudentServer } from "@/lib/api/dashboard/admin/student/server";
import { StudentDetailsContent } from "@/components/dashboard/admin/student/student-details-content";

export const metadata: Metadata = {
  title: "Student Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function StudentDetailsPage({ params }: PageProps) {
  let error: string | null = null;
  let details = null;

  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const studentId = decodeURIComponent(rawId);

  if (!studentId || studentId === "undefined" || studentId === "null") {
    error = "Invalid student id.";
  } else {
    try {
      details = await getStudentServer(studentId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load student.";
    }
  }

  return (
    <section className="mx-auto space-y-6">
      <DashboardPageHeader
        title="Student Details"
        description="View student information."
        action={
          <Link
            href="/dashboard/admin/students"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <StudentDetailsContent details={details} error={error} />
    </section>
  );
}
