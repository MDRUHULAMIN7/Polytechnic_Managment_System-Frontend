import type { Metadata } from "next";
import { SyncCurriculumClassSessionsButton } from "@/components/dashboard/admin/curriculum/sync-curriculum-class-sessions-button";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getCurriculumClassScheduleStatusServer } from "@/lib/api/dashboard/class-session/server";
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
  let hasScheduledSessions = false;

  try {
    const [curriculumDetails, scheduleStatus] = await Promise.all([
      getCurriculumServer(curriculumId),
      getCurriculumClassScheduleStatusServer(curriculumId),
    ]);
    details = curriculumDetails;
    hasScheduledSessions = scheduleStatus.hasSessions;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load curriculum.";
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Curriculum Details"
        description="Overview of curriculum details."
        action={
          <SyncCurriculumClassSessionsButton
            curriculumId={curriculumId}
            hasScheduledSessions={hasScheduledSessions}
          />
        }
      />

      <CurriculumDetailsContent
        details={details}
        error={error}
        outlineMode="admin"
      />
    </section>
  );
}
