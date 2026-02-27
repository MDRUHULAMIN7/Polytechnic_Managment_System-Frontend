import { InstructorDetailsModalShell } from "@/components/dashboard/admin/instructor/instructor-details-modal-shell";
import { InstructorDetailsContent } from "@/components/dashboard/admin/instructor/instructor-details-content";
import { getInstructorServer } from "@/lib/api/dashboard/admin/instructor/server";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function InstructorDetailsModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const instructorId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getInstructorServer(instructorId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load instructor.";
  }

  return (
    <InstructorDetailsModalShell>
      <InstructorDetailsContent details={details} error={error} />
    </InstructorDetailsModalShell>
  );
}
