import { getAcademicInstructorServer } from "@/lib/api/dashboard/admin/academic-instructor/server";
import { AcademicInstructorDetailsContent } from "@/components/dashboard/admin/academic-instructor/academic-instructor-details-content";
import { AcademicInstructorDetailsModalShell } from "@/components/dashboard/admin/academic-instructor/academic-instructor-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AcademicInstructorModalPage({
  params,
}: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const instructorId = decodeURIComponent(rawId);

  let error: string | null = null;
  let details = null;

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
    <AcademicInstructorDetailsModalShell>
      <AcademicInstructorDetailsContent details={details} error={error} />
    </AcademicInstructorDetailsModalShell>
  );
}
