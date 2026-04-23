
import type {
  OfferedSubject,
  OfferedSubjectScheduleBlock,
} from "@/lib/type/dashboard/admin/offered-subject";

export function parseTimeToMinutes(value: string) {
  if (!value) {
    return null;
  }
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
}

function resolveRoomLabel(block: OfferedSubjectScheduleBlock) {
  if (typeof block.room === "string") {
    return block.room;
  }

  const room = block.room;
  const parts = [
    room.roomName,
    room.buildingNumber ? `Bld ${room.buildingNumber}` : "",
    room.roomNumber ? `Room ${room.roomNumber}` : "",
  ].filter(Boolean);

  return parts.join(" - ") || "--";
}

export function formatScheduleBlock(block: OfferedSubjectScheduleBlock) {
  const periodRange =
    block.periodNumbers?.length
      ? `Periods ${block.periodNumbers.join(", ")}`
      : `Start ${block.startPeriod}, ${block.periodCount} periods`;
  const timeRange =
    block.startTimeSnapshot && block.endTimeSnapshot
      ? `${block.startTimeSnapshot}-${block.endTimeSnapshot}`
      : "";

  return [
    block.day,
    block.classType,
    resolveRoomLabel(block),
    periodRange,
    timeRange,
  ]
    .filter(Boolean)
    .join(" | ");
}

export function formatOfferedSubjectSchedule(value: Pick<
  OfferedSubject,
  "scheduleBlocks" | "days" | "startTime" | "endTime"
>) {
  if (value.scheduleBlocks?.length) {
    return value.scheduleBlocks.map(formatScheduleBlock).join("; ");
  }

  const daysLabel = value.days?.length ? value.days.join(", ") : "--";
  const timeLabel =
    value.startTime && value.endTime
      ? `${value.startTime}-${value.endTime}`
      : "";

  return [daysLabel, timeLabel].filter(Boolean).join(" ");
}

export function renderValue(value: unknown, fallback = "--") {
  if (!value) {
    return fallback;
  }
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object" && "name" in value && "year" in value) {
    const name = (value as { name?: string }).name ?? "";
    const year = (value as { year?: string }).year ?? "";
    return `${name} ${year}`.trim() || fallback;
  }
  if (typeof value === "object" && "name" in value) {
    return (value as { name?: string }).name ?? fallback;
  }
  if (typeof value === "object" && "title" in value) {
    return (value as { title?: string }).title ?? fallback;
  }
  return fallback;
}
