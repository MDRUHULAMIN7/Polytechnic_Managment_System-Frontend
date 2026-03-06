import { Suspense } from "react";
import { InstructorDetailsModalShell } from "@/components/dashboard/admin/instructor/instructor-details-modal-shell";
import { InstructorDetailsPanel } from "@/components/dashboard/admin/instructor/instructor-details-panel";
import { getInstructorSummaryServer } from "@/lib/api/dashboard/admin/instructor/server";

type PageProps = {
  params: {
    id: string;
  };
};

type ContentProps = {
  instructorId: string;
};

async function InstructorModalContent({ instructorId }: ContentProps) {
  let summary = null;
  let error: string | null = null;

  try {
    summary = await getInstructorSummaryServer(instructorId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load instructor.";
  }

  return (
    <InstructorDetailsPanel
      instructorId={instructorId}
      summary={summary}
      summaryError={error}
    />
  );
}

export default async function InstructorDetailsModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const instructorId = resolvedParams.id;

  return (
    <InstructorDetailsModalShell>
      <Suspense
        fallback={<p className="text-sm text-(--text-dim)">Loading instructor...</p>}
      >
        <InstructorModalContent instructorId={instructorId} />
      </Suspense>
    </InstructorDetailsModalShell>
  );
}
