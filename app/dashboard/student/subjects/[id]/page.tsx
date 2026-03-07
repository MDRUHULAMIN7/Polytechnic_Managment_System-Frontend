import Link from "next/link";
import type { Metadata } from "next";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import { getSubjectServer, getSubjectInstructorsServer } from "@/lib/api/dashboard/admin/subject/server";
import { SubjectDetailsContent } from "@/components/dashboard/admin/subject/subject-details-content";
import { SubjectInstructorsPanel } from "@/components/dashboard/instructor/subject/subject-instructors-panel";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

export const metadata: Metadata = {
  title: "Subject Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function SubjectDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const subjectId = decodeURIComponent(rawId);

  let error: string | null = null;
  let details = null;
  let instructorsError: string | null = null;
  let instructors: Instructor[] = [];

  if (!subjectId || subjectId === "undefined" || subjectId === "null") {
    error = "Invalid subject id.";
  } else {
    try {
      const [subjectResult, instructorsResult] = await Promise.allSettled([
        getSubjectServer(subjectId),
        getSubjectInstructorsServer(subjectId),
      ]);

      if (subjectResult.status === "fulfilled") {
        details = subjectResult.value;
      } else {
        error =
          subjectResult.reason instanceof Error
            ? subjectResult.reason.message
            : "Failed to load subject.";
      }

      if (instructorsResult.status === "fulfilled") {
        instructors = instructorsResult.value.instructors ?? [];
      } else {
        instructorsError =
          instructorsResult.reason instanceof Error
            ? instructorsResult.reason.message
            : "Failed to load instructors.";
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load subject.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <DashboardPageHeader
        title="Subject Details"
        description="View subject information and assigned instructors."
        action={
          <Link
            href="/dashboard/student/subjects"
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Back to List
          </Link>
        }
      />

      <SubjectDetailsContent details={details} error={error} />
      <SubjectInstructorsPanel instructors={instructors} error={instructorsError} />
    </section>
  );
}
