import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getOfferedSubjectServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import { OfferedSubjectDetailsContent } from "@/components/dashboard/admin/offered-subject/offered-subject-details-content";

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
  let error: string | null = null;

  if (!offeredSubjectId || offeredSubjectId === "undefined" || offeredSubjectId === "null") {
    error = "Invalid offered subject id.";
  } else {
    try {
      details = await getOfferedSubjectServer(offeredSubjectId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load offered subject.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <DashboardPageHeader
        title="Offered Subject Details"
        description="View offered subject information."
        action={
          <Link
            href="/dashboard/student/offered-subjects"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <OfferedSubjectDetailsContent details={details} error={error} />
    </section>
  );
}
