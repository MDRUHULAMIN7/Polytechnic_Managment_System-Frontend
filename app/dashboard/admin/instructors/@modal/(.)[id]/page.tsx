import { Suspense } from "react";
import { InstructorDetailsModalShell } from "@/components/dashboard/admin/instructor/instructor-details-modal-shell";
import { InstructorDetailsContent } from "@/components/dashboard/admin/instructor/instructor-details-content";
import { getInstructorServer } from "@/lib/api/dashboard/admin/instructor/server";

type PageProps = {
  params: {
    id: string;
  };
};

type ContentProps = {
  instructorId: string;
};

async function InstructorModalContent({ instructorId }: ContentProps) {
  let details = null;
  let error: string | null = null;

  try {
    details = await getInstructorServer(instructorId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load instructor.";
  }

  return <InstructorDetailsContent details={details} error={error} />;
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
