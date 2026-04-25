import { MarkingWorkspacePage } from "@/components/dashboard/shared/marking/marking-workspace-page";
import { loadMarkingOfferedSubjects } from "@/components/dashboard/shared/marking/marking-offered-subjects";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";

export async function AdminMarkingPageServer() {
  let items: OfferedSubject[] = [];
  let error: string | null = null;

  try {
    items = await loadMarkingOfferedSubjects();
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load offered subjects for review.";
  }

  return <MarkingWorkspacePage items={items} error={error} mode="view" />;
}
