import type { Metadata } from "next";
import { getOfferedSubjectServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import { OfferedSubjectDetailsContent } from "@/components/dashboard/admin/offered-subject/offered-subject-details-content";

export const metadata: Metadata = {
  title: "Offered Subject Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function OfferedSubjectDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const offeredSubjectId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getOfferedSubjectServer(offeredSubjectId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load offered subject.";
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Offered Subject Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            Overview of offered subject details.
          </p>
        </div>
      </div>

      <OfferedSubjectDetailsContent details={details} error={error} />
    </section>
  );
}
