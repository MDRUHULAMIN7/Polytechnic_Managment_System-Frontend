import { getSemesterEnrollmentServer } from "@/lib/api/dashboard/admin/semester-enrollment/server";
import { SemesterEnrollmentDetailsContent } from "@/components/dashboard/admin/semester-enrollment/semester-enrollment-details-content";
import { SemesterEnrollmentDetailsModalShell } from "@/components/dashboard/admin/semester-enrollment/semester-enrollment-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function SemesterEnrollmentModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const enrollmentId = decodeURIComponent(rawId);

  let details = null;
  let error: string | null = null;

  if (!enrollmentId || enrollmentId === "undefined" || enrollmentId === "null") {
    error = "Invalid semester enrollment id.";
  } else {
    try {
      details = await getSemesterEnrollmentServer(enrollmentId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load semester enrollment.";
    }
  }

  return (
    <SemesterEnrollmentDetailsModalShell>
      <SemesterEnrollmentDetailsContent details={details} error={error} />
    </SemesterEnrollmentDetailsModalShell>
  );
}
