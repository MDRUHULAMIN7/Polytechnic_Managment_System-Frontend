import { getOfferedSubjectServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import { OfferedSubjectDetailsContent } from "@/components/dashboard/admin/offered-subject/offered-subject-details-content";
import { OfferedSubjectDetailsModalShell } from "@/components/dashboard/admin/offered-subject/offered-subject-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function OfferedSubjectModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const offeredSubjectId = decodeURIComponent(rawId);

  let error: string | null = null;
  let details = null;

  if (!offeredSubjectId || offeredSubjectId === "undefined" || offeredSubjectId === "null") {
    error = "Invalid offered subject id.";
  } else {
    try {
      details = await getOfferedSubjectServer(offeredSubjectId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load offered subject.";
    }
  }

  return (
    <OfferedSubjectDetailsModalShell>
      <OfferedSubjectDetailsContent details={details} error={error} />
    </OfferedSubjectDetailsModalShell>
  );
}
