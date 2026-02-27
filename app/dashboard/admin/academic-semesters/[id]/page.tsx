import Link from "next/link";
import type { Metadata } from "next";
import { getAcademicSemesterServer } from "@/lib/api/dashboard/admin/academic-semester/server";
import { AcademicSemesterDetailsContent } from "@/components/dashboard/admin/academic-semester/academic-semester-details-content";

export const metadata: Metadata = {
  title: "Academic Semester Details",
};

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function AcademicSemesterDetailsPage({
  params,
}: PageProps) {
  let error: string | null = null;
  let details = null;

  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const semesterId = decodeURIComponent(rawId);

  if (!semesterId || semesterId === "undefined" || semesterId === "null") {
    error = "Invalid semester id.";
  } else {
    try {
      details = await getAcademicSemesterServer(semesterId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load semester.";
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
            Academic Semester Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View semester information.
          </p>
        </div>
        <Link
          href="/dashboard/admin/academic-semesters"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Back to List
        </Link>
      </div>

      <AcademicSemesterDetailsContent details={details} error={error} />
    </section>
  );
}
