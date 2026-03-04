import { getAcademicSemesterServer } from "@/lib/api/dashboard/admin/academic-semester/server";
import { AcademicSemesterDetailsContent } from "@/components/dashboard/admin/academic-semester/academic-semester-details-content";
import { AcademicSemesterDetailsModalShell } from "@/components/dashboard/admin/academic-semester/academic-semester-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AcademicSemesterModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const semesterId = decodeURIComponent(rawId);

  let details = null;
  let error: string | null = null;

  if (!semesterId || semesterId === "undefined" || semesterId === "null") {
    error = "Invalid academic semester id.";
  } else {
    try {
      details = await getAcademicSemesterServer(semesterId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load academic semester.";
    }
  }

  return (
    <AcademicSemesterDetailsModalShell>
      <AcademicSemesterDetailsContent details={details} error={error} />
    </AcademicSemesterDetailsModalShell>
  );
}
