import type { Metadata } from "next";
import { getInstructorSummaryServer } from "@/lib/api/dashboard/admin/instructor/server";
import { InstructorDetailsPanel } from "@/components/dashboard/admin/instructor/instructor-details-panel";
import Link from "next/link";

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
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Instructors Details</h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View instructor information.
          </p>
        </div>
        <Link
          href="/dashboard/admin/instructors"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Back to List
        </Link>
      </div>

      <InstructorDetailsPanel
        instructorId={instructorId}
        summary={summary}
        summaryError={error}
      />
    </section>
  );
}
