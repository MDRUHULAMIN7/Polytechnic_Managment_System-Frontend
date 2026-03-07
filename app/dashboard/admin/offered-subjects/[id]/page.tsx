import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getOfferedSubjectServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import { OfferedSubjectDetailsContent } from "@/components/dashboard/admin/offered-subject/offered-subject-details-content";

export const metadata: Metadata = {
  title: "Offered Subject Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function OfferedSubjectDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const offeredSubjectId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getOfferedSubjectServer(offeredSubjectId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load offered subject.";
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Offered Subject Details"
        description="Overview of offered subject details."
      />

      <OfferedSubjectDetailsContent details={details} error={error} />
    </section>
  );
}
