import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getAcademicSemesterServer } from "@/lib/api/dashboard/admin/academic-semester/server";
import { AcademicSemesterDetailsContent } from "@/components/dashboard/admin/academic-semester/academic-semester-details-content";

export const metadata: Metadata = {
  title: "Academic Semester Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AcademicSemesterDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const semesterId = decodeURIComponent(rawId);

  let details = null;
  let error: string | null = null;

  if (!semesterId || semesterId === "undefined" || semesterId === "null") {
    error = "Invalid academic semester id.";
  } else {
    try {
      details = await getAcademicSemesterServer(semesterId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Unable to load academic semester.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <DashboardPageHeader
        title="Academic Semester Details"
        description="View academic semester information."
        action={
          <Link
            href="/dashboard/student/academic-semesters"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <AcademicSemesterDetailsContent details={details} error={error} />
    </section>
  );
}
