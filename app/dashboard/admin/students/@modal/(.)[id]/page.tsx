import { getStudentServer } from "@/lib/api/dashboard/admin/student/server";
import { StudentDetailsContent } from "@/components/dashboard/admin/student/student-details-content";
import { StudentDetailsModalShell } from "@/components/dashboard/admin/student/student-details-modal-shell";

type PageProps = {
  params: { id: string } | Promise<{ id: string }>;
};

export default async function StudentModalPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  const rawId = resolvedParams?.id ?? "";
  const studentId = decodeURIComponent(rawId);

  let error: string | null = null;
  let details = null;

  if (!studentId || studentId === "undefined" || studentId === "null") {
    error = "Invalid student id.";
  } else {
    try {
      details = await getStudentServer(studentId);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load student.";
    }
  }

  return (
    <StudentDetailsModalShell>
      <StudentDetailsContent details={details} error={error} />
    </StudentDetailsModalShell>
  );
}
