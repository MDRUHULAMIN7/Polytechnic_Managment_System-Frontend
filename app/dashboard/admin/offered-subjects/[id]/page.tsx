import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getOfferedSubjectServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import { getOfferedSubjectMarkSheetServer } from "@/lib/api/dashboard/admin/enrolled-subject/server";
import { OfferedSubjectDetailsContent } from "@/components/dashboard/admin/offered-subject/offered-subject-details-content";
import { OfferedSubjectMarkingPanel } from "@/components/dashboard/admin/offered-subject/offered-subject-marking-panel";

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
  let markSheet = null;
  let error: string | null = null;

  try {
    details = await getOfferedSubjectServer(offeredSubjectId);
    markSheet = await getOfferedSubjectMarkSheetServer(offeredSubjectId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load offered subject.";
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Offered Subject Details"
        description="Overview of offered subject details and final result controls."
      />

      <OfferedSubjectDetailsContent details={details} error={error} />
      {markSheet ? <OfferedSubjectMarkingPanel initialData={markSheet} role="admin" /> : null}
    </section>
  );
}
