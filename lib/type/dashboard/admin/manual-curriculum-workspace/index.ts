import type { CurriculumPlanningStep1Data } from "../curriculum-planning";
import type {
  OfferedSubjectClassType,
  OfferedSubjectDay,
  OfferedSubjectScheduleBlock,
} from "../offered-subject";

/** Canonical conflict row from `POST /offered-subject/preview-conflicts`. */
export type SchedulePreviewConflict = {
  type: string;
  message: string;
  blockIndex: number;
  conflictingOfferedSubjectId?: string;
};

export type SchedulePreviewResult = {
  hasConflict: boolean;
  conflicts: SchedulePreviewConflict[];
  scheduleBlocks: OfferedSubjectScheduleBlock[];
  days: string[];
  startTime: string;
  endTime: string;
};

export type ManualWorkspaceDraftBlock = {
  id: string;
  subjectId: string;
  instructorId: string;
  classType: OfferedSubjectClassType;
  day: OfferedSubjectDay;
  room: string;
  startPeriod: number;
  periodCount: number;
};

export type ManualPlanningSubject = {
  subjectId: string;
  instructorId: string;
};

export type ManualWorkspaceDraft = {
  subjectId: string;
  instructorId: string;
  roomId: string;
  /** Mirrors step-1 max capacity; editable in toolbar if needed later. */
  maxCapacity: number;
  blocks: ManualWorkspaceDraftBlock[];
  plannedSubjects: ManualPlanningSubject[];
};

export type ManualWorkspaceRouteParams = CurriculumPlanningStep1Data;

export type RoutineGridSelection = {
  day: OfferedSubjectDay;
  startPeriod: number;
} | null;
