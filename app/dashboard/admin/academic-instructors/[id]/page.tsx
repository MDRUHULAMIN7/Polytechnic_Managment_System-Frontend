import Link from "next/link";
import type { Metadata } from "next";
import { getAcademicInstructorServer } from "@/lib/api/dashboard/admin/academic-instructor/server";
import { AcademicInstructorDetailsContent } from "@/components/dashboard/admin/academic-instructor/academic-instructor-details-content";

export const metadata: Metadata = {
  title: "Academic Instructor Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AcademicInstructorDetailsPage({
  params,
}: PageProps) {
  let error: string | null = null;
  let details = null;
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const instructorId = decodeURIComponent(rawId);

  if (!instructorId || instructorId === "undefined" || instructorId === "null") {
    error = "Invalid instructor id.";
  } else {
    try {
      details = await getAcademicInstructorServer(instructorId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load instructor.";
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Academic Instructor Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View instructor information.
          </p>
        </div>
        <Link
          href="/dashboard/admin/academic-instructors"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Back to List
        </Link>
      </div>

      <AcademicInstructorDetailsContent details={details} error={error} />
    </section>
  );
}
