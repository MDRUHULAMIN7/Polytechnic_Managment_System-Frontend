/**
 * Curriculum Planning - Planning Service
 * Orchestrates the multi-step curriculum planning workflow and executes the planning algorithm
 */

import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type {
  CurriculumPlanningBlock,
  CurriculumPlanExecutionResult,
  CurriculumPlanResult,
  CurriculumPlanningContext,
  BlockPlanningResult,
  ConflictInfo,
} from "@/lib/type/dashboard/admin/curriculum-planning";
import {
  calculateRequiredPeriodsPerWeek,
  checkPeriodConfigConflict,
  findAvailableRooms,
  findAvailableSlots,
  markSlotOccupied,
  generateConflictSummary,
  resolvePeriodPlanningMetrics,
} from "./conflict-detection";
import type { OfferedSubjectScheduleBlock } from "@/lib/type/dashboard/admin/offered-subject";

/**
 * Plans a single block (subject + instructor assignment)
 * This is the core algorithm that generates schedule blocks with conflict detection
 */
export async function planSingleBlock(
  block: CurriculumPlanningBlock,
  subject: Subject,
  instructor: Instructor,
  context: CurriculumPlanningContext,
): Promise<BlockPlanningResult> {
  const conflicts: ConflictInfo[] = [];
  const scheduledBlocks: OfferedSubjectScheduleBlock[] = [];
  const reasoning: string[] = [];
  const instructorDisplayName =
    [instructor.name.firstName, instructor.name.lastName].filter(Boolean).join(" ") ||
    "Unknown";

  try {
    // Step 1: Inspect subject type and calculate required periods
    reasoning.push(`Subject Type: ${subject.subjectType}`);
    
    const requiredPeriods = calculateRequiredPeriodsPerWeek(subject);
    reasoning.push(
      `Required periods: Theory=${requiredPeriods.theory}, Practical=${requiredPeriods.practical}`,
    );

    // Step 2: Check period configuration constraints
    const totalRequired = requiredPeriods.theory + requiredPeriods.practical;
    const { totalPeriodsPerWeek } = resolvePeriodPlanningMetrics(
      context.periodConfig,
    );
    const periodConfigConflict = checkPeriodConfigConflict(
      totalRequired,
      totalPeriodsPerWeek,
      subject,
    );

    if (periodConfigConflict) {
      conflicts.push(periodConfigConflict);
      reasoning.push(
        `Period config conflict: ${periodConfigConflict.message}`,
      );
      return {
        blockId: block.id,
        success: false,
        scheduleBlocks: [],
        conflicts,
        roomAllocations: [],
        reasoning: reasoning.join("; "),
      };
    }

    // Step 3: Find available slots for instructor
    const availableSlots = findAvailableSlots(block.instructorId, totalRequired, context);
    
    if (availableSlots.length === 0) {
      conflicts.push({
        type: "INSTRUCTOR_CONFLICT",
        instructorId: block.instructorId,
        instructorName: instructorDisplayName,
        conflictingBlocks: [],
        severity: "HIGH",
        message: `No available slots for instructor ${instructorDisplayName} for ${totalRequired} periods`,
      });
      reasoning.push(`No available slots found for instructor`);
      return {
        blockId: block.id,
        success: false,
        scheduleBlocks: [],
        conflicts,
        roomAllocations: [],
        reasoning: reasoning.join("; "),
      };
    }

    // Step 4: Allocate theory classes first
    if (requiredPeriods.theory > 0) {
      const theorySlot = availableSlots[0]; // Use first available
      reasoning.push(`Allocating theory classes on ${theorySlot.day}`);

      const theoryRooms = findAvailableRooms(
        theorySlot.day,
        theorySlot.periods,
        "THEORY",
        context,
      );

      if (theoryRooms.length === 0) {
        // Try fallback to practical rooms
        const practicalRooms = findAvailableRooms(
          theorySlot.day,
          theorySlot.periods,
          "PRACTICAL",
          context,
        );

        if (practicalRooms.length === 0) {
          conflicts.push({
            type: "ROOM_TYPE_CONFLICT",
            subjectId: subject._id,
            subjectTitle: subject.title,
            classType: "theory",
            requiredRoomType: "THEORY",
            availableRoomTypes: [],
            severity: "HIGH",
            message: `No theory or practical rooms available for ${subject.title}`,
          });
          reasoning.push(`No suitable rooms for theory classes`);
        } else {
          const room = context.rooms.get(practicalRooms[0]);
          if (room) {
            scheduledBlocks.push({
              classType: "theory",
              day: theorySlot.day,
              room: room,
              startPeriod: theorySlot.periods[0],
              periodCount: theorySlot.periods.length,
              periodNumbers: theorySlot.periods,
            });
            reasoning.push(
              `Allocated theory class to ${room.roomName} ${room.roomNumber} (fallback from practical room)`,
            );
            markSlotOccupied(
              block.instructorId,
              theorySlot.day,
              theorySlot.periods,
              practicalRooms[0],
              context,
            );
          }
        }
      } else {
        const room = context.rooms.get(theoryRooms[0]);
        if (room) {
          scheduledBlocks.push({
            classType: "theory",
            day: theorySlot.day,
            room: room,
            startPeriod: theorySlot.periods[0],
            periodCount: theorySlot.periods.length,
            periodNumbers: theorySlot.periods,
          });
          reasoning.push(`Allocated theory class to ${room.roomName} ${room.roomNumber}`);
          markSlotOccupied(
            block.instructorId,
            theorySlot.day,
            theorySlot.periods,
            theoryRooms[0],
            context,
          );
        }
      }
    }

    // Step 5: Allocate practical classes
    if (requiredPeriods.practical > 0) {
      const practicalSlot = availableSlots[availableSlots.length - 1]; // Use another available slot
      reasoning.push(`Allocating practical classes on ${practicalSlot.day}`);

      const practicalRooms = findAvailableRooms(
        practicalSlot.day,
        practicalSlot.periods,
        "PRACTICAL",
        context,
      );

      if (practicalRooms.length === 0) {
        conflicts.push({
          type: "ROOM_TYPE_CONFLICT",
          subjectId: subject._id,
          subjectTitle: subject.title,
          classType: "practical",
          requiredRoomType: "PRACTICAL",
          availableRoomTypes: [],
          severity: "MEDIUM",
          message: `No practical rooms available for ${subject.title}`,
        });
        reasoning.push(`No practical rooms available`);
      } else {
        const room = context.rooms.get(practicalRooms[0]);
        if (room) {
          scheduledBlocks.push({
            classType: "practical",
            day: practicalSlot.day,
            room: room,
            startPeriod: practicalSlot.periods[0],
            periodCount: practicalSlot.periods.length,
            periodNumbers: practicalSlot.periods,
          });
          reasoning.push(`Allocated practical class to ${room.roomName} ${room.roomNumber}`);
          markSlotOccupied(
            block.instructorId,
            practicalSlot.day,
            practicalSlot.periods,
            practicalRooms[0],
            context,
          );
        }
      }
    }

    return {
      blockId: block.id,
      success: conflicts.length === 0 || conflicts.every((c) => c.severity !== "HIGH"),
      scheduleBlocks: scheduledBlocks,
      conflicts,
      roomAllocations: scheduledBlocks.map((sb) => ({
        classType: sb.classType,
        roomId: typeof sb.room === "string" ? sb.room : sb.room?._id || "",
        days: [sb.day],
        periods: sb.periodNumbers || [sb.startPeriod],
      })),
      reasoning: reasoning.join("; "),
    };
  } catch (error) {
    reasoning.push(`Error during planning: ${error instanceof Error ? error.message : "Unknown error"}`);
    return {
      blockId: block.id,
      success: false,
      scheduleBlocks: [],
      conflicts,
      roomAllocations: [],
      reasoning: reasoning.join("; "),
    };
  }
}

/**
 * Executes the full curriculum planning for all blocks sequentially
 */
export async function executeCurriculumPlanning(
  blocks: CurriculumPlanningBlock[],
  subjectsMap: Map<string, Subject>,
  instructorsMap: Map<string, Instructor>,
  context: CurriculumPlanningContext,
  onProgress?: (completed: number, total: number) => void,
): Promise<CurriculumPlanExecutionResult> {
  const results: CurriculumPlanResult[] = [];
  const totalConflicts: ConflictInfo[] = [];
  let successfulBlocks = 0;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const subject = subjectsMap.get(block.subjectId);
    const instructor = instructorsMap.get(block.instructorId);

    if (!subject || !instructor) {
      results.push({
        blockId: block.id,
        subjectId: block.subjectId,
        instructorId: block.instructorId,
        success: false,
        scheduleBlocks: [],
        conflicts: [],
        warnings: [`Subject or Instructor not found`],
        reasoning: "Failed to load subject or instructor data",
      });
      onProgress?.(i + 1, blocks.length);
      continue;
    }

    // Plan the block
    const blockResult = await planSingleBlock(
      block,
      subject,
      instructor,
      context,
    );

    // Simulate API delay for realistic progress
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Convert to CurriculumPlanResult
    const result: CurriculumPlanResult = {
      blockId: blockResult.blockId,
      subjectId: block.subjectId,
      instructorId: block.instructorId,
      success: blockResult.success,
      scheduleBlocks: blockResult.scheduleBlocks,
      conflicts: blockResult.conflicts,
      warnings: [],
      reasoning: blockResult.reasoning,
    };

    results.push(result);
    totalConflicts.push(...blockResult.conflicts);

    if (blockResult.success) {
      successfulBlocks++;
    }

    onProgress?.(i + 1, blocks.length);
  }

  return {
    results,
    summary: {
      totalBlocks: blocks.length,
      successfulBlocks,
      failedBlocks: blocks.length - successfulBlocks,
      conflictsDetected: totalConflicts.length,
      totalConflicts,
    },
    createdOfferedSubjects: [], // Will be populated by the caller after API save
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validates a curriculum plan execution result
 */
export function validatePlanningResult(result: CurriculumPlanExecutionResult): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (result.summary.failedBlocks > 0) {
    errors.push(
      `${result.summary.failedBlocks} blocks failed to plan. Manual review required.`,
    );
  }

  const highSeverityConflicts = result.summary.totalConflicts.filter(
    (c) => c.severity === "HIGH",
  );
  if (highSeverityConflicts.length > 0) {
    errors.push(
      `${highSeverityConflicts.length} high-severity conflicts detected. ${generateConflictSummary(highSeverityConflicts)}`,
    );
  }

  const mediumSeverityConflicts = result.summary.totalConflicts.filter(
    (c) => c.severity === "MEDIUM",
  );
  if (mediumSeverityConflicts.length > 0) {
    warnings.push(
      `${mediumSeverityConflicts.length} medium-severity conflicts. ${generateConflictSummary(mediumSeverityConflicts)}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
