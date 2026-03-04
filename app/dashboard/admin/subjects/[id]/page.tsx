import type { Metadata } from "next";
import { getSubjectServer } from "@/lib/api/dashboard/admin/subject/server";
import { SubjectDetailsContent } from "@/components/dashboard/admin/subject/subject-details-content";

export const metadata: Metadata = {
  title: "Subject Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function SubjectDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const subjectId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getSubjectServer(subjectId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load subject.";
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Subject Details</h1>
          <p className="mt-2 text-sm text-(--text-dim)">Overview of subject details.</p>
        </div>
      </div>

      <SubjectDetailsContent details={details} error={error} />
    </section>
  );
}
