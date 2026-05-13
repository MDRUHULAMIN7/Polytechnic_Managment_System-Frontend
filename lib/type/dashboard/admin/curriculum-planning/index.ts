/**
 * Curriculum Planning Types & Interfaces
 * Comprehensive type definitions for the multi-step curriculum planning workflow
 */

import type { AcademicDepartment } from "../academic-department";
import type { AcademicInstructor } from "../academic-instructor";
import type { AcademicSemester } from "../academic-semester";
import type { Instructor } from "../instructor";
import type { Room } from "../room";
import type { Subject } from "../subject";
import type { SemesterRegistration } from "../semester-registration";
import type { OfferedSubjectDay, OfferedSubjectClassType, OfferedSubjectScheduleBlock } from "../offered-subject";

/**
 * Step 1: Initial Selection & Setup
 */
export interface CurriculumPlanningStep1Data {
  academicInstructorId: string;
  academicDepartmentId: string;
  semesterRegistrationId: string;
  maxCapacity: number; // 1-60
}

/**
 * Step 2: Subject & Instructor Assignment
 */
export interface CurriculumPlanningBlock {
  id: string;
  subjectId: string;
  instructorId: string;
  maxCapacity: number;
}

export interface CurriculumPlanningStep2Data {
  blocks: CurriculumPlanningBlock[];
}

/**
 * Conflict Detection Types
 */
export interface InstructorScheduleConflict {
  type: "INSTRUCTOR_CONFLICT";
  instructorId: string;
  instructorName: string;
  conflictingBlocks: {
    subjectId: string;
    subjectTitle: string;
    day: OfferedSubjectDay;
    period: number;
    room: string;
  }[];
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export interface RoomConflict {
  type: "ROOM_CONFLICT";
  roomId: string;
  roomLabel: string;
  conflictingSchedules: {
    classType: OfferedSubjectClassType;
    day: OfferedSubjectDay;
    periods: number[];
    instructor: string;
    subject: string;
  }[];
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export interface RoomTypeConflict {
  type: "ROOM_TYPE_CONFLICT";
  subjectId: string;
  subjectTitle: string;
  classType: OfferedSubjectClassType;
  requiredRoomType: string;
  availableRoomTypes: string[];
  severity: "HIGH" | "MEDIUM";
  message: string;
}

export interface PeriodConfigConflict {
  type: "PERIOD_CONFIG_CONFLICT";
  subjectId: string;
  subjectTitle: string;
  requiredPeriods: number;
  availablePeriods: number;
  severity: "HIGH";
  message: string;
}

export type ConflictInfo =
  | InstructorScheduleConflict
  | RoomConflict
  | RoomTypeConflict
  | PeriodConfigConflict;

/**
 * Planning Execution Result
 */
export interface CurriculumPlanResult {
  blockId: string;
  subjectId: string;
  instructorId: string;
  success: boolean;
  scheduleBlocks: OfferedSubjectScheduleBlock[];
  conflicts: ConflictInfo[];
  warnings: string[];
  reasoning: string;
}

export interface CurriculumPlanExecutionResult {
  results: CurriculumPlanResult[];
  summary: {
    totalBlocks: number;
    successfulBlocks: number;
    failedBlocks: number;
    conflictsDetected: number;
    totalConflicts: ConflictInfo[];
  };
  createdOfferedSubjects: string[]; // IDs of created OfferedSubject records
  timestamp: string;
}

/**
 * Planning Session State (In-Memory)
 */
export interface CurriculumPlanningSession {
  sessionId: string;
  step: 1 | 2 | 3;
  step1Data?: CurriculumPlanningStep1Data;
  step2Data?: CurriculumPlanningStep2Data;
  isPlanning: boolean;
  executionResult?: CurriculumPlanExecutionResult;
  lastUpdated: string;
}

/**
 * Edit State After Planning
 */
export interface CurriculumPlanEditState {
  offeredSubjectId: string;
  subjectId: string;
  instructorId: string;
  currentScheduleBlocks: OfferedSubjectScheduleBlock[];
  potentialConflicts: ConflictInfo[];
  editedScheduleBlocks?: OfferedSubjectScheduleBlock[];
  hasConflicts: boolean;
}

/**
 * Support Data loaded at each step
 */
export interface CurriculumPlanningStep1SupportData {
  academicInstructors: AcademicInstructor[];
  semesterRegistrations: SemesterRegistration[];
  academicDepartments: AcademicDepartment[];
}

export interface CurriculumPlanningStep2SupportData {
  subjects: Subject[];
  instructors: Instructor[];
  periodConfig: PeriodConfig;
  existingSchedules: ExistingScheduleSnapshot[];
}

export interface PeriodConfig {
  _id: string;
  label: string;
  isActive: boolean;
  periods: Period[];
}

export interface Period {
  periodNo: number;
  title?: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  durationMinutes: number;
  isBreak?: boolean;
}

export interface ExistingScheduleSnapshot {
  instructorId: string;
  instructorName: string;
  day: OfferedSubjectDay;
  period: number;
  subjectTitle: string;
  classType: OfferedSubjectClassType;
}

/**
 * Room Management
 */
export interface RoomInfo extends Room {
  type: "THEORY" | "PRACTICAL" | "BOTH";
  capacity: number;
  suitableFor?: SubjectType[];
}

export interface RoomAvailabilitySnapshot {
  roomId: string;
  roomLabel: string;
  roomType: string;
  day: OfferedSubjectDay;
  period: number;
  available: boolean;
}

/**
 * Planning Context for Algorithm
 */
export interface CurriculumPlanningContext {
  semesterRegistrationId: string;
  academicInstructorId: string;
  academicDepartmentId: string;
  subjects: Map<string, Subject>;
  instructors: Map<string, Instructor>;
  rooms: Map<string, RoomInfo>;
  periodConfig: PeriodConfig;
  existingSchedules: ExistingScheduleSnapshot[];
  occupiedSlots: Set<string>; // "${instructorId}:${day}:${period}"
  roomOccupancy: Map<string, Set<string>>; // roomId -> Set of "${day}:${period}"
}

/**
 * Planning Algorithm Types
 */
export interface BlockPlanningRequest {
  block: CurriculumPlanningBlock;
  subject: Subject;
  instructor: Instructor;
  context: CurriculumPlanningContext;
}

export interface BlockPlanningResult {
  blockId: string;
  success: boolean;
  scheduleBlocks: OfferedSubjectScheduleBlock[];
  conflicts: ConflictInfo[];
  roomAllocations: {
    classType: OfferedSubjectClassType;
    roomId: string;
    days: OfferedSubjectDay[];
    periods: number[];
  }[];
  reasoning: string;
}
