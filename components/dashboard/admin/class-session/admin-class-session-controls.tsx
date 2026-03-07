"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  cancelClassSessionAction,
  rescheduleClassSessionAction,
} from "@/actions/dashboard/class-session";
import type { ClassSessionStatus } from "@/lib/type/dashboard/class-session";
import { showToast } from "@/utils/common/toast";

type AdminClassSessionControlsProps = {
  classSessionId: string;
  status: ClassSessionStatus;
  date: string;
  startTime: string;
  endTime: string;
};

export function AdminClassSessionControls({
  classSessionId,
  status,
  date,
  startTime,
  endTime,
}: AdminClassSessionControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nextDate, setNextDate] = useState(date.slice(0, 10));
  const [nextStartTime, setNextStartTime] = useState(startTime);
  const [nextEndTime, setNextEndTime] = useState(endTime);

  const canReschedule = !["ONGOING", "COMPLETED"].includes(status);
  const canCancel = !["ONGOING", "COMPLETED", "CANCELLED"].includes(status);

  function handleReschedule() {
    startTransition(async () => {
      try {
        await rescheduleClassSessionAction(classSessionId, {
          date: nextDate,
          startTime: nextStartTime,
          endTime: nextEndTime,
        });
        showToast({
          variant: "success",
          title: "Class rescheduled",
          description: "The class is back in scheduled state.",
        });
        router.refresh();
      } catch (error) {
        showToast({
          variant: "error",
          title: error instanceof Error ? error.message : "Reschedule failed.",
          description: "Please review the class schedule and try again.",
        });
      }
    });
  }

  function handleCancel() {
    startTransition(async () => {
      try {
        await cancelClassSessionAction(classSessionId);
        showToast({
          variant: "success",
          title: "Class cancelled",
          description: "Instructors can no longer start this class.",
        });
        router.refresh();
      } catch (error) {
        showToast({
          variant: "error",
          title: error instanceof Error ? error.message : "Cancel failed.",
          description: "Please try again.",
        });
      }
    });
  }

  return (
    <div className="mt-5 rounded-2xl border border-(--line) bg-(--surface-muted) p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Admin Controls</h2>
          <p className="mt-1 text-sm text-(--text-dim)">
            Reschedule a specific class or cancel it before the instructor starts.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Date</span>
          <input
            type="date"
            value={nextDate}
            onChange={(event) => setNextDate(event.target.value)}
            disabled={!canReschedule || isPending}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-sm">
          <span className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">Start</span>
          <input
            type="time"
            value={nextStartTime}
            onChange={(event) => setNextStartTime(event.target.value)}
            disabled={!canReschedule || isPending}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm disabled:opacity-60"
          />
        </label>
        <label className="text-sm">
          <span className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">End</span>
          <input
            type="time"
            value={nextEndTime}
            onChange={(event) => setNextEndTime(event.target.value)}
            disabled={!canReschedule || isPending}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm disabled:opacity-60"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleReschedule}
          disabled={!canReschedule || isPending}
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && canReschedule ? "Saving..." : "Reschedule Class"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!canCancel || isPending}
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-red-400/50 px-4 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel Class
        </button>
      </div>
    </div>
  );
}
