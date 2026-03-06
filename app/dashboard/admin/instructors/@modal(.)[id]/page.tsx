import { InstructorDetailsModalShell } from "@/components/dashboard/admin/instructor/instructor-details-modal-shell";
import { InstructorDetailsPanel } from "@/components/dashboard/admin/instructor/instructor-details-panel";
import { getInstructorSummaryServer } from "@/lib/api/dashboard/admin/instructor/server";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function InstructorDetailsModalPage({ params }: PageProps) {
  const instructorId = params.id;
  let summary = null;
  let error: string | null = null;

  try {
    summary = await getInstructorSummaryServer(instructorId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load instructor.";
  }

  return (
    <InstructorDetailsModalShell>
      <InstructorDetailsPanel
        instructorId={instructorId}
        summary={summary}
        summaryError={error}
      />
    </InstructorDetailsModalShell>
  );
}
