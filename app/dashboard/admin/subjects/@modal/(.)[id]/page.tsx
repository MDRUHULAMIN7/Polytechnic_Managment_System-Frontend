import { SubjectDetailsModalShell } from "@/components/dashboard/admin/subject/subject-details-modal-shell";
import { SubjectDetailsContent } from "@/components/dashboard/admin/subject/subject-details-content";
import { getSubjectServer } from "@/lib/api/dashboard/admin/subject/server";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function SubjectDetailsModalPage({ params }: PageProps) {
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
    <SubjectDetailsModalShell>
      <SubjectDetailsContent details={details} error={error} />
    </SubjectDetailsModalShell>
  );
}
