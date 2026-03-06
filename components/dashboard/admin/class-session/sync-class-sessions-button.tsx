"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { syncClassSessionsAction } from "@/actions/dashboard/class-session";
import { showToast } from "@/utils/common/toast";

export function SyncClassSessionsButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSync() {
    startTransition(async () => {
      try {
        const result = await syncClassSessionsAction({});
        showToast({
          variant: "success",
          title: "Class sessions synced",
          description: `Processed ${result.totalOfferedSubjects} offered subjects.`,
        });
        router.refresh();
      } catch (error) {
        showToast({
          variant: "error",
          title: error instanceof Error ? error.message : "Sync failed.",
          description: "Please try again.",
        });
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={isPending}
      className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted) disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isPending ? "Syncing..." : "Sync Existing Sessions"}
    </button>
  );
}
