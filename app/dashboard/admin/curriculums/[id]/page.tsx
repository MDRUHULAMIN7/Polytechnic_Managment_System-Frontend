import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getCurriculumServer } from "@/lib/api/dashboard/admin/curriculum/server";
import { CurriculumDetailsContent } from "@/components/dashboard/admin/curriculum/curriculum-details-content";

export const metadata: Metadata = {
  title: "Curriculum Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function CurriculumDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const curriculumId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getCurriculumServer(curriculumId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load curriculum.";
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Curriculum Details"
        description="Overview of curriculum details."
      />

      <CurriculumDetailsContent
        details={details}
        error={error}
        outlineMode="admin"
      />
    </section>
  );
}
