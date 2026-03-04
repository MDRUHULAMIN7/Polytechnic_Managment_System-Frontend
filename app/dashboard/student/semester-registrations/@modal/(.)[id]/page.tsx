import { getSemesterRegistrationServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import { SemesterRegistrationDetailsContent } from "@/components/dashboard/admin/semester-registration/semester-registration-details-content";
import { SemesterRegistrationDetailsModalShell } from "@/components/dashboard/admin/semester-registration/semester-registration-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function SemesterRegistrationModalPage({ params }: PageProps) {
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
    <SemesterRegistrationDetailsModalShell>
      <SemesterRegistrationDetailsContent details={details} error={error} />
    </SemesterRegistrationDetailsModalShell>
  );
}
