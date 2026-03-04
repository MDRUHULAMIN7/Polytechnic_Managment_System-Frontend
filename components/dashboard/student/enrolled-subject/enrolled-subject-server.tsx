import { getMyEnrolledSubjectsServer } from "@/lib/api/dashboard/admin/enrolled-subject/server";
import type { EnrolledSubject } from "@/lib/type/dashboard/admin/enrolled-subject";
import { EnrolledSubjectPage } from "./enrolled-subject-page";

export async function EnrolledSubjectPageServer() {
  let items: EnrolledSubject[] = [];
  let error: string | null = null;

  try {
    items = await getMyEnrolledSubjectsServer();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load.";
  }

  return <EnrolledSubjectPage items={items} error={error} />;
}
