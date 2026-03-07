import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getSemesterRegistrationServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import { SemesterRegistrationDetailsContent } from "@/components/dashboard/admin/semester-registration/semester-registration-details-content";

export const metadata: Metadata = {
  title: "Semester Registration Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function SemesterRegistrationDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const registrationId = decodeURIComponent(rawId);

  let details = null;
  let error: string | null = null;

  if (!registrationId || registrationId === "undefined" || registrationId === "null") {
    error = "Invalid semester registration id.";
  } else {
    try {
      details = await getSemesterRegistrationServer(registrationId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load registration.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <DashboardPageHeader
        title="Semester Registration Details"
        description="View semester registration information."
        action={
          <Link
            href="/dashboard/student/semester-registrations"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <SemesterRegistrationDetailsContent details={details} error={error} />
    </section>
  );
}
