import Link from "next/link";
import type { Metadata } from "next";
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Student Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Offered Subject Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            View offered subject information.
          </p>
        </div>
        <Link
          href="/dashboard/student/offered-subjects"
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Back to List
        </Link>
      </div>

      <OfferedSubjectDetailsContent details={details} error={error} />
    </section>
  );
}
