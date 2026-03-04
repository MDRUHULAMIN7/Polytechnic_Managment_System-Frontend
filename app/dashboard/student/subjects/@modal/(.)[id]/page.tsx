import { getSubjectServer, getSubjectInstructorsServer } from "@/lib/api/dashboard/admin/subject/server";
import { SubjectDetailsContent } from "@/components/dashboard/admin/subject/subject-details-content";
import { SubjectDetailsModalShell } from "@/components/dashboard/admin/subject/subject-details-modal-shell";
import { SubjectInstructorsPanel } from "@/components/dashboard/instructor/subject/subject-instructors-panel";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function SubjectModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const subjectId = decodeURIComponent(rawId);

  let error: string | null = null;
  let details = null;
  let instructorsError: string | null = null;
  let instructors = [];

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
    <SubjectDetailsModalShell>
      <SubjectDetailsContent details={details} error={error} />
      <div className="mt-4">
        <SubjectInstructorsPanel instructors={instructors} error={instructorsError} />
      </div>
    </SubjectDetailsModalShell>
  );
}
