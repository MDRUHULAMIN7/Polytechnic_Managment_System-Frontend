import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getCurriculumServer } from "@/lib/api/dashboard/admin/curriculum/server";
import { CurriculumDetailsContent } from "@/components/dashboard/admin/curriculum/curriculum-details-content";

export const metadata: Metadata = {
  title: "Curriculum Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function CurriculumDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const curriculumId = decodeURIComponent(rawId);

  let details = null;
  let error: string | null = null;

  if (!curriculumId || curriculumId === "undefined" || curriculumId === "null") {
    error = "Invalid curriculum id.";
  } else {
    try {
      details = await getCurriculumServer(curriculumId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load curriculum.";
    }
  }

  return (
    <section className="mx-auto space-y-6">
      <DashboardPageHeader
        title="Curriculum Details"
        description="View curriculum information and subjects."
        action={
          <Link
            href="/dashboard/instructor/curriculums"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
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
