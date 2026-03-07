import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getSubjectServer } from "@/lib/api/dashboard/admin/subject/server";
import { SubjectDetailsContent } from "@/components/dashboard/admin/subject/subject-details-content";

export const metadata: Metadata = {
  title: "Subject Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function SubjectDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const subjectId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getSubjectServer(subjectId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load subject.";
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Subject Details"
        description="Overview of subject details."
      />

      <SubjectDetailsContent details={details} error={error} />
    </section>
  );
}
