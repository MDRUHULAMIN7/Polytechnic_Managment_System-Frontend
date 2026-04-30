"use client";

import type { RefObject } from "react";
import type { BulkOfferedSubjectSchedulePlan } from "@/lib/type/dashboard/admin/offered-subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";

export interface AgenticPlannerModalProps {
  open: boolean;
  onClose: () => void;
  semesterRegistrationId: string;
  academicInstructorId: string;
  academicDepartmentId: string;
  onSaved: () => void;
}

export interface AssignmentBlock {
  id: string;
  instructorId: string;
  subjectId: string;
  maxCapacity: number;
}

export type RoutineViewMode = "list" | "routine";

export type RoutineExportBlock = {
  classType: "theory" | "practical" | "tutorial";
  day: string;
  startPeriod: number;
  periodCount: number;
  periodNumbers: number[];
  startTimeSnapshot: string;
  endTimeSnapshot: string;
  roomLabel: string;
  subjectTitle: string;
  instructorName: string;
};

export interface AgenticPlannerAssignmentPanelProps {
  blocks: AssignmentBlock[];
  instructors: Instructor[];
  subjects: Subject[];
  planning: boolean;
  onAddBlock: () => void;
  onRemoveBlock: (id: string) => void;
  onUpdateBlock: (id: string, updates: Partial<AssignmentBlock>) => void;
  onCreatePlan: () => void;
}

export interface AgenticPlannerResultsPanelProps {
  blocks: AssignmentBlock[];
  instructors: Instructor[];
  planResult: BulkOfferedSubjectSchedulePlan | null;
  viewMode: RoutineViewMode;
  isDesktopRoutineEnabled: boolean;
  isFullView: boolean;
  saving: boolean;
  inlineRoutineRef: RefObject<HTMLDivElement | null>;
  fullViewRoutineRef: RefObject<HTMLDivElement | null>;
  onSetViewMode: (mode: RoutineViewMode) => void;
  onOpenFullView: () => void;
  onCloseFullView: () => void;
  onDownload: () => void;
  onSaveAll: () => void;
}
