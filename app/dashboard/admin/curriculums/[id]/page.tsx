import type { Metadata } from "next";
import { getCurriculumServer } from "@/lib/api/dashboard/admin/curriculum/server";
import { CurriculumDetailsContent } from "@/components/dashboard/admin/curriculum/curriculum-details-content";

export const metadata: Metadata = {
  title: "Curriculum Details",
};

type PageProps = {
  params: {
    id: string;
  };
};

export default async function CurriculumDetailsPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const curriculumId = resolvedParams.id;
  let details = null;
  let error: string | null = null;

  try {
    details = await getCurriculumServer(curriculumId);
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load curriculum.";
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Admin Module
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Curriculum Details
          </h1>
          <p className="mt-2 text-sm text-(--text-dim)">
            Overview of curriculum details.
          </p>
        </div>
      </div>

      <CurriculumDetailsContent
        details={details}
        error={error}
        outlineMode="admin"
      />
    </section>
  );
}
