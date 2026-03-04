import Link from "next/link";
import type { Metadata } from "next";
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
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Instructor Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Curriculum Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View curriculum information and subjects.
          </p>
        </div>
        <Link
          href="/dashboard/instructor/curriculums"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Back to List
        </Link>
      </div>

      <CurriculumDetailsContent details={details} error={error} />
    </section>
  );
}
