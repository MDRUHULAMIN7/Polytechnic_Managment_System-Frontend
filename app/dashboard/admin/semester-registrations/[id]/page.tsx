import type { Metadata } from "next";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Semester Registration Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            Overview of registration details.
          </p>
        </div>
      </div>

      <SemesterRegistrationDetailsContent details={details} error={error} />
    </section>
  );
}
