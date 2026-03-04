import { getCurriculumServer } from "@/lib/api/dashboard/admin/curriculum/server";
import { CurriculumDetailsContent } from "@/components/dashboard/admin/curriculum/curriculum-details-content";
import { CurriculumDetailsModalShell } from "@/components/dashboard/admin/curriculum/curriculum-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function CurriculumModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const curriculumId = decodeURIComponent(rawId);

  let error: string | null = null;
  let details = null;

  if (!curriculumId || curriculumId === "undefined" || curriculumId === "null") {
    error = "Invalid curriculum id.";
  } else {
    try {
      details = await getCurriculumServer(curriculumId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load curriculum.";
    }
  }

  return (
    <CurriculumDetailsModalShell>
      <CurriculumDetailsContent details={details} error={error} />
    </CurriculumDetailsModalShell>
  );
}
