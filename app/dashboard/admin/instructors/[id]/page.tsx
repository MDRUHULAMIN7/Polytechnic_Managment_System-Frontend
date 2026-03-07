import type { Metadata } from "next";
import { getInstructorSummaryServer } from "@/lib/api/dashboard/admin/instructor/server";
import { InstructorDetailsPanel } from "@/components/dashboard/admin/instructor/instructor-details-panel";
import Link from "next/link";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";

export const metadata: Metadata = {
  title: "Instructor Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function InstructorDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const instructorId = resolvedParams.id;
  let summary = null;
  let error: string | null = null;

  try {
    summary = await getInstructorSummaryServer(instructorId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load instructor.";
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Instructors Details"
        description="View instructor information."
        action={
          <Link
            href="/dashboard/admin/instructors"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <InstructorDetailsPanel
        instructorId={instructorId}
        summary={summary}
        summaryError={error}
      />
    </section>
  );
}
