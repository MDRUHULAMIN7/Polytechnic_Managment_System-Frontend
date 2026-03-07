"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncClassSessionsAction } from "@/actions/dashboard/class-session";
import { showToast } from "@/utils/common/toast";

type SyncCurriculumClassSessionsButtonProps = {
  curriculumId: string;
  hasScheduledSessions: boolean;
};

export function SyncCurriculumClassSessionsButton({
  curriculumId,
  hasScheduledSessions,
}: SyncCurriculumClassSessionsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSync() {
    startTransition(async () => {
      try {
        const result = await syncClassSessionsAction({ curriculumId });
        showToast({
          variant: "success",
          title: "Class schedule prepared",
          description: `Processed ${result.totalOfferedSubjects} offered subjects for this curriculum.`,
        });
        router.refresh();
      } catch (error) {
        showToast({
          variant: "error",
          title: error instanceof Error ? error.message : "Scheduling failed.",
          description: "Please review the curriculum and offered subjects.",
        });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={isPending || hasScheduledSessions}
      className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
    >
      {hasScheduledSessions
        ? "Classes Scheduled"
        : isPending
          ? "Scheduling..."
          : "Schedule Classes"}
    </button>
  );
}
