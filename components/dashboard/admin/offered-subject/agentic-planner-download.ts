"use client";

import type { BulkOfferedSubjectSchedulePlan } from "@/lib/type/dashboard/admin/offered-subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import { drawRoutineImage } from "./agentic-planner-routine";
import type { AssignmentBlock } from "./agentic-planner-types";

type DownloadRoutineImageParams = {
  planResult: BulkOfferedSubjectSchedulePlan;
  blocks: AssignmentBlock[];
  instructors: Instructor[];
  filename?: string;
};

export function downloadRoutinePlanImage({
  planResult,
  blocks,
  instructors,
  filename = `routine-${Date.now()}.png`,
}: DownloadRoutineImageParams) {
  const canvas = drawRoutineImage(planResult, blocks, instructors);
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  link.click();

  return filename;
}
