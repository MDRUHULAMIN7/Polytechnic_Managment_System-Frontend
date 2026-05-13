"use client";

import { createOfferedSubjectAction } from "@/actions/dashboard/admin/offered-subject";
import {
  getOfferedSubjects,
  planBulkOfferedSubjectSchedule,
} from "@/lib/api/dashboard/admin/offered-subject";
import { getInstructors } from "@/lib/api/dashboard/admin/instructor";
import { getSubjects } from "@/lib/api/dashboard/admin/subject";
import { resolveName } from "@/utils/dashboard/admin/utils";
import type {
  BulkOfferedSubjectSchedulePlan,
  BulkOfferedSubjectSchedulePlanEntry,
  OfferedSubjectInput,
} from "@/lib/type/dashboard/admin/offered-subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { AssignmentBlock } from "./agentic-planner-types";

type PlannerSupportDataParams = {
  academicDepartmentId: string;
  semesterRegistrationId: string;
};

type SavePlannedSubjectsParams = {
  planResult: BulkOfferedSubjectSchedulePlan;
  blocks: AssignmentBlock[];
  semesterRegistrationId: string;
  academicInstructorId: string;
  academicDepartmentId: string;
};

export const createEmptyAssignmentBlock = (): AssignmentBlock => ({
  id: crypto.randomUUID(),
  instructorId: "",
  subjectId: "",
  maxCapacity: 40,
});

export async function loadAgenticPlannerSupportData({
  academicDepartmentId,
  semesterRegistrationId,
}: PlannerSupportDataParams): Promise<{
  instructors: Instructor[];
  subjects: Subject[];
}> {
  const [instructorData, subjectData, offeredData] = await Promise.all([
    getInstructors({
      page: 1,
      limit: 100,
      academicDepartment: academicDepartmentId,
    }),
    getSubjects({
      page: 1,
      limit: 200,
      sort: "title",
    }),
    getOfferedSubjects({
      page: 1,
      limit: 100,
      semesterRegistration: semesterRegistrationId,
    }),
  ]);

  const instructors = instructorData.result ?? [];
  const offeredSubjectIds = new Set(
    (offeredData.result ?? [])
      .map((offeredSubject) =>
        typeof offeredSubject.subject === "string"
          ? offeredSubject.subject
          : offeredSubject.subject?._id,
      )
      .filter(Boolean),
  );
  const subjects = (subjectData.result ?? []).filter(
    (subject) => !offeredSubjectIds.has(subject._id),
  );

  return {
    instructors,
    subjects,
  };
}

export const buildBulkPlannerEntries = (
  blocks: AssignmentBlock[],
): BulkOfferedSubjectSchedulePlanEntry[] =>
  blocks
    .filter((block) => block.instructorId && block.subjectId)
    .map((block) => ({
      subject: block.subjectId,
      instructor: block.instructorId,
      maxCapacity: block.maxCapacity,
    }));

export async function generateBulkRoutinePlan(args: {
  semesterRegistrationId: string;
  academicInstructorId: string;
  academicDepartmentId: string;
  entries: BulkOfferedSubjectSchedulePlanEntry[];
}) {
  return planBulkOfferedSubjectSchedule({
    semesterRegistration: args.semesterRegistrationId,
    academicInstructor: args.academicInstructorId,
    academicDepartment: args.academicDepartmentId,
    entries: args.entries,
  });
}

export async function savePlannedOfferedSubjects({
  planResult,
  blocks,
  semesterRegistrationId,
  academicInstructorId,
  academicDepartmentId,
}: SavePlannedSubjectsParams) {
  let successCount = 0;

  for (const plan of planResult.plans) {
    const block = blocks.find((item) => item.subjectId === plan.subjectId);
    if (!block) {
      continue;
    }

    const payload: OfferedSubjectInput = {
      semesterRegistration: semesterRegistrationId,
      academicInstructor: academicInstructorId,
      academicDepartment: academicDepartmentId,
      subject: plan.subjectId,
      instructor: block.instructorId,
      maxCapacity: block.maxCapacity,
      scheduleBlocks: plan.suggestedBlocks.map((suggestedBlock) => ({
        classType: suggestedBlock.classType,
        day: suggestedBlock.day,
        room: suggestedBlock.room,
        startPeriod: suggestedBlock.startPeriod,
        periodCount: suggestedBlock.periodCount,
      })),
    };

    const result = await createOfferedSubjectAction(payload);
    if (result?._id) {
      successCount += 1;
    }
  }

  return successCount;
}

export function downloadRoutinePlanCSV(
  planResult: BulkOfferedSubjectSchedulePlan,
  blocks: AssignmentBlock[],
  instructors: Instructor[],
) {
  const headers = [
    "Subject",
    "Instructor",
    "Class Type",
    "Day",
    "Start Time",
    "End Time",
    "Room",
    "Capacity",
  ];

  const rows = planResult.plans.flatMap((plan) => {
    const block = blocks.find((b) => b.subjectId === plan.subjectId);
    const instructor = instructors.find((i) => i._id === block?.instructorId);
    const instructorName = instructor ? resolveName(instructor.name) : "N/A";

    return plan.suggestedBlocks.map((sb) => [
      `"${plan.planningMeta.subjectTitle}"`,
      `"${instructorName}"`,
      sb.classType.toUpperCase(),
      sb.day,
      sb.startTimeSnapshot,
      sb.endTimeSnapshot,
      `"${sb.roomLabel}"`,
      block?.maxCapacity || 40,
    ]);
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Room_Assignment_Report_${new Date().toISOString().split("T")[0]}.csv`,
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
