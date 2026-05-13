/**
 * Curriculum Planning - Conflict Detection Service
 * Detects scheduling conflicts, room allocation issues, and instructor availability problems
 */

import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type {
  ConflictInfo,
  InstructorScheduleConflict,
  RoomConflict,
  RoomTypeConflict,
  PeriodConfigConflict,
  CurriculumPlanningContext,
} from "@/lib/type/dashboard/admin/curriculum-planning";
import type {
  OfferedSubjectClassType,
  OfferedSubjectDay,
  OfferedSubjectScheduleBlock,
} from "@/lib/type/dashboard/admin/offered-subject";

/**
 * Calculates required periods per week based on subject type and credits
 */
export function calculateRequiredPeriodsPerWeek(
  subject: Subject,
): { theory: number; practical: number } {
  const theoryPeriodsNeeded = subject.theoryPeriodsPerWeek ?? 0;

  // Theory: 1 theory period = 1 class (50 mins = 1 period)
  // Practical: 3 practical periods = 1 class (150 mins = 3 periods)
  const practicalPeriodsRaw = subject.practicalPeriodsPerWeek ?? 0;
  const practicalPeriodsNeeded = Math.ceil(practicalPeriodsRaw / 3) * 3;

  return {
    theory: theoryPeriodsNeeded,
    practical: practicalPeriodsNeeded,
  };
}

/**
 * Checks for instructor schedule conflicts
 * Returns conflict if instructor is already scheduled in the same period
 */
export function checkInstructorConflict(
  instructorId: string,
  instructorName: string,
  day: OfferedSubjectDay,
  periods: number[],
  context: CurriculumPlanningContext,
): InstructorScheduleConflict | null {
  const conflictingBlocks = context.existingSchedules
    .filter(
      (schedule) =>
        schedule.instructorId === instructorId &&
        schedule.day === day &&
        periods.includes(schedule.period),
    )
    .map((schedule) => ({
      subjectId: "", // We don't have this in the snapshot
      subjectTitle: schedule.subjectTitle,
      day: schedule.day,
      period: schedule.period,
      room: "", // We don't have this in the snapshot
    }));

  if (conflictingBlocks.length > 0) {
    return {
      type: "INSTRUCTOR_CONFLICT",
      instructorId,
      instructorName,
      conflictingBlocks,
      severity: "HIGH",
      message: `Instructor ${instructorName} has conflicting classes on ${day} in periods ${periods.join(", ")}`,
    };
  }

  // Also check in-memory occupied slots
  const hasConflict = periods.some(
    (period) =>
      context.occupiedSlots.has(`${instructorId}:${day}:${period}`),
  );

  if (hasConflict) {
    return {
      type: "INSTRUCTOR_CONFLICT",
      instructorId,
      instructorName,
      conflictingBlocks: [],
      severity: "HIGH",
      message: `Instructor ${instructorName} is already assigned for ${day}`,
    };
  }

  return null;
}

/**
 * Checks for room conflicts and availability
 */
export function checkRoomConflict(
  roomId: string,
  roomLabel: string,
  day: OfferedSubjectDay,
  periods: number[],
  context: CurriculumPlanningContext,
): RoomConflict | null {
  const roomOccupancy = context.roomOccupancy.get(roomId);
  
  if (!roomOccupancy) {
    return null; // Room not tracked yet
  }

  const conflictingSchedules = periods
    .filter((period) => roomOccupancy.has(`${day}:${period}`))
    .map((period) => ({
      classType: "theory" as OfferedSubjectClassType,
      day,
      periods: [period],
      instructor: "Unknown",
      subject: "Unknown",
    }));

  if (conflictingSchedules.length > 0) {
    return {
      type: "ROOM_CONFLICT",
      roomId,
      roomLabel,
      conflictingSchedules,
      severity: "HIGH",
      message: `Room ${roomLabel} is not available on ${day} for all required periods`,
    };
  }

  return null;
}

/**
 * Checks if room type is suitable for class type
 */
export function checkRoomTypeConflict(
  classType: OfferedSubjectClassType,
  room: Room,
  subject: Subject,
): RoomTypeConflict | null {
  const normalizedRoomType = room.roomType; // Already lowercase literals

  // Theory classes need theoretical rooms or fallback to practical
  if (classType === "theory") {
    // Check if room is marked for theory
    const isTheoryRoom =
      normalizedRoomType === "theory" || normalizedRoomType === "both";
    if (!isTheoryRoom) {
      // Fallback is allowed, so no conflict, just a note
      return null;
    }
  }

  // Practical classes need practical rooms
  if (classType === "practical") {
    const isPracticalRoom =
      normalizedRoomType === "practical" || normalizedRoomType === "both";
    if (!isPracticalRoom) {
      return {
        type: "ROOM_TYPE_CONFLICT",
        subjectId: subject._id,
        subjectTitle: subject.title,
        classType,
        requiredRoomType: "PRACTICAL",
        availableRoomTypes: [room.roomType || "UNKNOWN"],
        severity: "HIGH",
        message: `No suitable practical room available for ${subject.title}`,
      };
    }
  }

  return null;
}

/**
 * Checks if period configuration allows enough periods for the classes
 */
export function checkPeriodConfigConflict(
  requiredPeriodsPerWeek: number,
  availablePeriodsPerWeek: number,
  subject: Subject,
): PeriodConfigConflict | null {
  if (requiredPeriodsPerWeek > availablePeriodsPerWeek) {
    return {
      type: "PERIOD_CONFIG_CONFLICT",
      subjectId: subject._id,
      subjectTitle: subject.title,
      requiredPeriods: requiredPeriodsPerWeek,
      availablePeriods: availablePeriodsPerWeek,
      severity: "HIGH",
      message: `Insufficient periods in configuration. Required: ${requiredPeriodsPerWeek}, Available: ${availablePeriodsPerWeek}`,
    };
  }

  return null;
}

/**
 * Validates a proposed schedule block for conflicts
 */
export function validateScheduleBlock(
  scheduleBlock: OfferedSubjectScheduleBlock,
  instructorName: string,
  subjectTitle: string,
  context: CurriculumPlanningContext,
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];

  // For now, we check room conflicts
  const roomId = typeof scheduleBlock.room === "string" 
    ? scheduleBlock.room 
    : scheduleBlock.room?._id;

  if (roomId) {
    const roomConflict = checkRoomConflict(
      roomId,
      typeof scheduleBlock.room === "string"
        ? scheduleBlock.room
        : `${scheduleBlock.room?.roomName ?? ""} ${scheduleBlock.room?.roomNumber ?? ""}`.trim() ||
          "Unknown",
      scheduleBlock.day,
      scheduleBlock.periodNumbers || [scheduleBlock.startPeriod],
      context,
    );

    if (roomConflict) {
      conflicts.push(roomConflict);
    }
  }

  return conflicts;
}

/**
 * Marks a slot as occupied in the context
 */
export function markSlotOccupied(
  instructorId: string,
  day: OfferedSubjectDay,
  periods: number[],
  roomId: string | undefined,
  context: CurriculumPlanningContext,
): void {
  // Mark instructor slots
  periods.forEach((period) => {
    context.occupiedSlots.add(`${instructorId}:${day}:${period}`);
  });

  // Mark room slots
  if (roomId) {
    const roomOccupancy = context.roomOccupancy.get(roomId) || new Set();
    periods.forEach((period) => {
      roomOccupancy.add(`${day}:${period}`);
    });
    context.roomOccupancy.set(roomId, roomOccupancy);
  }
}

/**
 * Finds available rooms for a given day and periods
 */
export function findAvailableRooms(
  day: OfferedSubjectDay,
  periods: number[],
  roomType: "THEORY" | "PRACTICAL" | "BOTH",
  context: CurriculumPlanningContext,
): string[] {
  const availableRooms: string[] = [];

  context.rooms.forEach((room, roomId) => {
    const normalizedRoomType = room.roomType.toUpperCase();

    // Check if room type matches
    if (roomType === "THEORY" && !["THEORY", "BOTH"].includes(normalizedRoomType)) {
      return;
    }
    if (
      roomType === "PRACTICAL" &&
      !["PRACTICAL", "BOTH"].includes(normalizedRoomType)
    ) {
      return;
    }

    // Check if all periods are available
    const roomOccupancy = context.roomOccupancy.get(roomId) || new Set();
    const isAvailable = !periods.some((period) =>
      roomOccupancy.has(`${day}:${period}`),
    );

    if (isAvailable) {
      availableRooms.push(roomId);
    }
  });

  return availableRooms;
}

/**
 * Finds available slots for an instructor
 */
export function findAvailableSlots(
  instructorId: string,
  requiredPeriodsPerWeek: number,
  context: CurriculumPlanningContext,
): Array<{ day: OfferedSubjectDay; periods: number[] }> {
  const workingDays = context.periodConfig.workingDays;
  const totalPeriodsPerDay = context.periodConfig.totalPeriodsPerWeek / workingDays.length;
  const availableSlots: Array<{ day: OfferedSubjectDay; periods: number[] }> = [];

  workingDays.forEach((day) => {
    let consecutiveFree = 0;
    const freePeriods: number[] = [];

    for (let period = 1; period <= totalPeriodsPerDay; period++) {
      if (!context.occupiedSlots.has(`${instructorId}:${day}:${period}`)) {
        freePeriods.push(period);
        consecutiveFree++;
      } else {
        consecutiveFree = 0;
        freePeriods.length = 0;
      }

      if (consecutiveFree >= requiredPeriodsPerWeek) {
        availableSlots.push({
          day,
          periods: freePeriods.slice(-requiredPeriodsPerWeek),
        });
        break;
      }
    }
  });

  return availableSlots;
}

/**
 * Comprehensive conflict detection summary
 */
export function generateConflictSummary(conflicts: ConflictInfo[]): string {
  const byType = conflicts.reduce(
    (acc, conflict) => {
      const count = (acc[conflict.type] || 0) + 1;
      return { ...acc, [conflict.type]: count };
    },
    {} as Record<string, number>,
  );

  const highSeverityCount = conflicts.filter(
    (c) => c.severity === "HIGH",
  ).length;
  const mediumSeverityCount = conflicts.filter(
    (c) => c.severity === "MEDIUM",
  ).length;

  return `Found ${conflicts.length} conflicts: ${highSeverityCount} HIGH severity, ${mediumSeverityCount} MEDIUM severity. Types: ${JSON.stringify(byType)}`;
}
