import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getAcademicInstructorServer } from "@/lib/api/dashboard/admin/academic-instructor/server";
import { AcademicInstructorDetailsContent } from "@/components/dashboard/admin/academic-instructor/academic-instructor-details-content";

export const metadata: Metadata = {
  title: "Academic Instructor Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AcademicInstructorDetailsPage({
  params,
}: PageProps) {
  let error: string | null = null;
  let details = null;
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const instructorId = decodeURIComponent(rawId);

  if (!instructorId || instructorId === "undefined" || instructorId === "null") {
    error = "Invalid instructor id.";
  } else {
    try {
      details = await getAcademicInstructorServer(instructorId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load instructor.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <DashboardPageHeader
        title="Academic Instructor Details"
        description="View instructor information."
        action={
          <Link
            href="/dashboard/admin/academic-instructors"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <AcademicInstructorDetailsContent details={details} error={error} />
    </section>
  );
}
