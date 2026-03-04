import { Suspense } from "react";
import { getCurriculumServer } from "@/lib/api/dashboard/admin/curriculum/server";
import { CurriculumDetailsContent } from "@/components/dashboard/admin/curriculum/curriculum-details-content";
import { CurriculumDetailsModalShell } from "@/components/dashboard/admin/curriculum/curriculum-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

type ContentProps = {
  curriculumId: string;
};

async function CurriculumModalContent({ curriculumId }: ContentProps) {
  let details = null;
  let error: string | null = null;

  if (!curriculumId || curriculumId === "undefined" || curriculumId === "null") {
    error = "Invalid curriculum id.";
  } else {
    try {
      details = await getCurriculumServer(curriculumId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load curriculum.";
    }
  }

  return <CurriculumDetailsContent details={details} error={error} />;
}

export default async function CurriculumModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const curriculumId = decodeURIComponent(rawId);

  return (
    <CurriculumDetailsModalShell>
      <Suspense
        fallback={<p className="text-sm text-(--text-dim)">Loading curriculum...</p>}
      >
        <CurriculumModalContent curriculumId={curriculumId} />
      </Suspense>
    </CurriculumDetailsModalShell>
  );
}
