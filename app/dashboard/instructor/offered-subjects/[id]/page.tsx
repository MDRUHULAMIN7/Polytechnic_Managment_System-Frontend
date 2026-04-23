import Link from "next/link";
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
  params: { id: string } | Promise<{ id: string }>;
};

export default async function OfferedSubjectDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const offeredSubjectId = decodeURIComponent(rawId);

  let details = null;
  let markSheet = null;
  let error: string | null = null;

  if (!offeredSubjectId || offeredSubjectId === "undefined" || offeredSubjectId === "null") {
    error = "Invalid offered subject id.";
  } else {
    try {
      details = await getOfferedSubjectServer(offeredSubjectId);
      markSheet = await getOfferedSubjectMarkSheetServer(offeredSubjectId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load offered subject.";
    }
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="Offered Subject Details"
        description="View offered subject information and manage component-based marks."
        action={
          <Link
            href="/dashboard/instructor/offered-subjects"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <OfferedSubjectDetailsContent details={details} error={error} />
      {markSheet ? <OfferedSubjectMarkingPanel initialData={markSheet} role="instructor" /> : null}
    </section>
  );
}
