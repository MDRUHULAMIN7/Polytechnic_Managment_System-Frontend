import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getSemesterRegistrationServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import { SemesterRegistrationDetailsContent } from "@/components/dashboard/admin/semester-registration/semester-registration-details-content";

export const metadata: Metadata = {
  title: "Semester Registration Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function SemesterRegistrationDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const registrationId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getSemesterRegistrationServer(registrationId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load registration.";
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Semester Registration Details"
        description="Overview of registration details."
      />

      <SemesterRegistrationDetailsContent details={details} error={error} />
    </section>
  );
}
