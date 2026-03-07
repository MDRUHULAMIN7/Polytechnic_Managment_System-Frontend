import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getSemesterEnrollmentServer } from "@/lib/api/dashboard/admin/semester-enrollment/server";
import { SemesterEnrollmentDetailsContent } from "@/components/dashboard/admin/semester-enrollment/semester-enrollment-details-content";

export const metadata: Metadata = {
  title: "Semester Enrollment Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function SemesterEnrollmentDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const enrollmentId = decodeURIComponent(rawId);

  let details = null;
  let error: string | null = null;

  if (!enrollmentId || enrollmentId === "undefined" || enrollmentId === "null") {
    error = "Invalid semester enrollment id.";
  } else {
    try {
      details = await getSemesterEnrollmentServer(enrollmentId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load semester enrollment.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <DashboardPageHeader
        title="Semester Enrollment Details"
        description="View semester enrollment information."
        action={
          <Link
            href="/dashboard/student/semester-enrollments"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <SemesterEnrollmentDetailsContent details={details} error={error} />
    </section>
  );
}
