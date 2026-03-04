import Link from "next/link";
import type { Metadata } from "next";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Instructor Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Subject Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View subject information and assigned instructors.
          </p>
        </div>
        <Link
          href="/dashboard/instructor/subjects"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Back to List
        </Link>
      </div>

      <SubjectDetailsContent details={details} error={error} />
      <SubjectInstructorsPanel instructors={instructors} error={instructorsError} />
    </section>
  );
}
