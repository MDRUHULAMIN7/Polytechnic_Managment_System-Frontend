/**
 * Curriculum Planning - API Service
 * Handles server communication for curriculum planning workflow
 */

import type {
  ConflictInfo,
  CurriculumPlanningStep1SupportData,
  CurriculumPlanningStep2SupportData,
  CurriculumPlanningBlock,
  CurriculumPlanExecutionResult,
  CurriculumPlanResult,
} from "@/lib/type/dashboard/admin/curriculum-planning";
import type {
  OfferedSubject,
  OfferedSubjectDay,
  OfferedSubjectClassType,
  OfferedSubjectInput,
  OfferedSubjectScheduleBlock,
} from "@/lib/type/dashboard/admin/offered-subject";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Room } from "@/lib/type/dashboard/admin/room";
import { API_BASE_URL } from "@/lib/api/dashboard/api"; // Import API_BASE_URL

interface BackendSuggestedBlock {
  classType: OfferedSubjectClassType;
  day: OfferedSubjectDay;
  room: string | Room;
  startPeriod: number;
  periodCount: number;
  periodNumbers: number[];
}

interface BackendPlan {
  subjectId: string;
  suggestedBlocks: BackendSuggestedBlock[];
  warnings: string[];
  reasoning: string[];
}

/**
 * Load support data for Step 1 (Academic Instructor, Department, Semester selection)
 */
export async function loadStep1SupportData(): Promise<CurriculumPlanningStep1SupportData> {
  try {
    const [instructorsRes, departmentsRes, semesterRegistrationsRes] =
      await Promise.all([
        fetch(`${API_BASE_URL}/academic-instructor?limit=100`),
        fetch(`${API_BASE_URL}/academic-department?limit=100`),
        fetch(`${API_BASE_URL}/semester-registrations?limit=100`),
      ]);

    if (!instructorsRes.ok || !departmentsRes.ok || !semesterRegistrationsRes.ok) {
      throw new Error("Failed to load support data");
    }

    const instructorsData = await instructorsRes.json();
    const departmentsData = await departmentsRes.json();
    const semesterRegistrationsData = await semesterRegistrationsRes.json();

    return {
      academicInstructors: instructorsData.data?.result ?? [],
      academicDepartments: departmentsData.data?.result ?? [],
      semesterRegistrations: semesterRegistrationsData.data?.result ?? [],
    };
  } catch (error) {
    console.error("Error loading Step 1 support data:", error);
    throw error;
  }
}

/**
 * Load support data for Step 2 (Subjects, Instructors, Period Config)
 */
export async function loadStep2SupportData(
  academicDepartmentId: string,
  semesterRegistrationId: string,
): Promise<CurriculumPlanningStep2SupportData> {
  try {
    const [subjectsRes, instructorsRes, periodConfigRes] = await Promise.all([
      fetch(`${API_BASE_URL}/subjects?limit=200&sort=title`),
      fetch(
        `${API_BASE_URL}/instructors?academicDepartment=${academicDepartmentId}&limit=100`,
      ),
      fetch(`${API_BASE_URL}/period-configs/active`),
    ]);

    if (!subjectsRes.ok || !instructorsRes.ok || !periodConfigRes.ok) {
      throw new Error("Failed to load Step 2 support data");
    }

    const subjectsData = await subjectsRes.json();
    const instructorsData = await instructorsRes.json();
    const periodConfigData = await periodConfigRes.json();
    const activePeriodConfig = periodConfigData.data ?? periodConfigData.result ?? null;

    if (!activePeriodConfig) {
      throw new Error("Failed to load active period configuration.");
    }

    // Filter out already offered subjects
    const offeredSubjectsRes = await fetch(
      `${API_BASE_URL}/offered-subject?semesterRegistration=${semesterRegistrationId}&limit=1000`,
    );
    const offeredSubjectsData = await offeredSubjectsRes.json();

    const offeredSubjectIds = new Set(
      (offeredSubjectsData.data?.result ?? [])
        .map((offeredSubject: OfferedSubject) =>
          typeof offeredSubject.subject === "string"
            ? offeredSubject.subject
            : offeredSubject.subject?._id,
        )
        .filter(Boolean),
    );

    const availableSubjects = (subjectsData.data?.result ?? []).filter(
      (subject: Subject) => !offeredSubjectIds.has(subject._id),
    );

    return {
      subjects: availableSubjects,
      instructors: instructorsData.data?.result ?? [],
      periodConfig: periodConfigData.data || {
        _id: "default",
        label: "Default Config",
        isActive: true,
        periods: Array.from({ length: 8 }, (_, i) => ({
          periodNo: i + 1,
          startTime: `${Math.floor(8 + i * 0.833)}:${Math.floor((i * 50) % 60)}`,
          endTime: `${Math.floor(8 + (i + 1) * 0.833)}:${Math.floor(((i + 1) * 50) % 60)}`,
          durationMinutes: 50,
          isBreak: false,
        })),
      },
      existingSchedules: [], // TODO: Fetch existing schedules for conflict detection
    };
  } catch (error) {
    console.error("Error loading Step 2 support data:", error);
    throw error;
  }
}

/**
 * Execute curriculum planning (calls backend planning algorithm)
 */
export async function executeCurriculumPlanningAPI(
  semesterRegistrationId: string,
  academicInstructorId: string,
  academicDepartmentId: string,
  blocks: CurriculumPlanningBlock[],
  onProgress?: (completed: number, total: number) => void,
): Promise<CurriculumPlanExecutionResult> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/offered-subject/plan-bulk-schedule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semesterRegistration: semesterRegistrationId,
          academicInstructor: academicInstructorId,
          academicDepartment: academicDepartmentId,
          entries: blocks.map((b) => ({
            subject: b.subjectId,
            instructor: b.instructorId,
            maxCapacity: b.maxCapacity,
          })),
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to execute curriculum planning");
    }

    const result = await response.json();
    console.log("Planning API Response:", result);
    onProgress?.(blocks.length, blocks.length);

    // Transform backend response to frontend expected format
    const backendData = result.data as {
      plans: BackendPlan[];
      summary: string;
    };

    const blockIdBySubjectId = new Map(blocks.map((b) => [b.subjectId, b.id]));
    const instructorIdBySubjectId = new Map(blocks.map((b) => [b.subjectId, b.instructorId]));

    const transformedResults: CurriculumPlanResult[] = backendData.plans.map((plan) => {
      const blockId = blockIdBySubjectId.get(plan.subjectId) || `block-${plan.subjectId}`;
      const instructorId = instructorIdBySubjectId.get(plan.subjectId) || "";
      const success = plan.suggestedBlocks.length > 0;

      return {
        blockId,
        subjectId: plan.subjectId,
        instructorId,
        success,
        scheduleBlocks: plan.suggestedBlocks.map((sb) => ({
          classType: sb.classType,
          day: sb.day,
          room: sb.room,
          startPeriod: sb.startPeriod,
          periodCount: sb.periodCount,
          periodNumbers: sb.periodNumbers,
        })),
        conflicts: [], // Backend doesn't return conflicts in this format yet
        warnings: plan.warnings || [],
        reasoning: plan.reasoning.join("; "),
      };
    });

    const successfulBlocks = transformedResults.filter((r) => r.success).length;

    return {
      results: transformedResults,
      summary: {
        totalBlocks: blocks.length,
        successfulBlocks,
        failedBlocks: blocks.length - successfulBlocks,
        conflictsDetected: 0,
        totalConflicts: [],
      },
      createdOfferedSubjects: [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error executing curriculum planning:", error);
    throw error;
  }
}

/**
 * Save offered subjects from planning results
 */
export async function savePlannedOfferedSubjects(
  semesterRegistrationId: string,
  academicInstructorId: string,
  academicDepartmentId: string,
  planResults: CurriculumPlanExecutionResult,
  blocks: CurriculumPlanningBlock[],
): Promise<{ createdIds: string[] }> {
  try {
    const capacityByBlockId = new Map(blocks.map((block) => [block.id, block.maxCapacity]));
    const offeredSubjects: OfferedSubjectInput[] = planResults.results
      .filter((r) => r.success && r.scheduleBlocks.length > 0)
      .map((result) => ({
        semesterRegistration: semesterRegistrationId,
        academicInstructor: academicInstructorId,
        academicDepartment: academicDepartmentId,
        subject: result.subjectId,
        instructor: result.instructorId,
        maxCapacity: capacityByBlockId.get(result.blockId) ?? 40,
        scheduleBlocks: result.scheduleBlocks.map((sb) => ({
          classType: sb.classType,
          day: sb.day,
          room: typeof sb.room === "string" ? sb.room : sb.room?._id || "",
          startPeriod: sb.startPeriod,
          periodCount: sb.periodCount,
        })),
      }));

    const response = await fetch(
      `${API_BASE_URL}/offered-subject/bulk-create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ offeredSubjects }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to save planned offered subjects");
    }

    const result = await response.json();
    return { createdIds: result.data?.ids ?? [] };
  } catch (error) {
    console.error("Error saving planned offered subjects:", error);
    throw error;
  }
}

/**
 * Load all active rooms
 */
export async function loadRooms(): Promise<Room[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms?limit=100`);
    if (!response.ok) {
      throw new Error("Failed to load rooms");
    }
    const data = await response.json();
    return data.data ?? [];
  } catch (error) {
    console.error("Error loading rooms:", error);
    throw error;
  }
}

/**
 * Check for schedule conflicts for a given offered subject
 */
export async function checkScheduleConflicts(
  payload: {
    semesterRegistrationId: string;
    academicDepartmentId: string;
    instructorId: string;
    maxCapacity: number;
    scheduleBlocks: OfferedSubjectScheduleBlock[];
    excludeOfferedSubjectId?: string | null;
  },
): Promise<{
  hasConflict: boolean;
  conflicts: ConflictInfo[];
  scheduleBlocks: OfferedSubjectScheduleBlock[];
  days: string[];
  startTime: string;
  endTime: string;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/offered-subject/preview-conflicts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semesterRegistration: payload.semesterRegistrationId,
          academicDepartment: payload.academicDepartmentId,
          instructor: payload.instructorId,
          maxCapacity: payload.maxCapacity,
          excludeOfferedSubjectId: payload.excludeOfferedSubjectId ?? undefined,
          scheduleBlocks: payload.scheduleBlocks.map((sb) => ({
            classType: sb.classType,
            day: sb.day,
            room: typeof sb.room === "string" ? sb.room : sb.room?._id || "",
            startPeriod: sb.startPeriod,
            periodCount: sb.periodCount,
          })),
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to check schedule conflicts");
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error checking schedule conflicts:", error);
    throw error;
  }
}
