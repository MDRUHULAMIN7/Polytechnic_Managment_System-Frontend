"use client";

import type { RefObject } from "react";
import type { BulkOfferedSubjectSchedulePlan } from "@/lib/type/dashboard/admin/offered-subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import { resolveName } from "@/utils/dashboard/admin/utils";
import type { AssignmentBlock, RoutineExportBlock } from "./agentic-planner-types";

const routineDays = ["Sun", "Mon", "Tue", "Wed", "Thu"] as const;

const getRoomLabelDisplay = (roomLabel: string) =>
  roomLabel.split("|")[2]?.replace("Room", "").trim() || roomLabel;

export const buildRoutineExportData = (
  plan: BulkOfferedSubjectSchedulePlan,
  blocks: AssignmentBlock[],
  instructors: Instructor[],
) => {
  const exportBlocks: RoutineExportBlock[] = plan.plans.flatMap((entry) => {
    const assignmentBlock = blocks.find((block) => block.subjectId === entry.subjectId);
    const instructor = instructors.find(
      (item) => item._id === assignmentBlock?.instructorId,
    );
    const instructorName = instructor ? resolveName(instructor.name) : "N/A";

    return entry.suggestedBlocks.map((block) => ({
      ...block,
      subjectTitle: entry.planningMeta.subjectTitle,
      instructorName,
    }));
  });

  const periods = Array.from(
    new Set(exportBlocks.flatMap((block) => block.periodNumbers)),
  ).sort((left, right) => left - right);

  return {
    blocks: exportBlocks,
    periods,
    days: routineDays,
  };
};

const drawRoundedRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fillColor: string,
  strokeColor?: string,
) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  context.fillStyle = fillColor;
  context.fill();

  if (strokeColor) {
    context.strokeStyle = strokeColor;
    context.lineWidth = 2;
    context.stroke();
  }
};

const drawWrappedText = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) => {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
      return;
    }

    if (currentLine) {
      lines.push(currentLine);
    }
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  lines.slice(0, maxLines).forEach((line, index) => {
    const isLastVisibleLine = index === maxLines - 1 && lines.length > maxLines;
    context.fillText(
      isLastVisibleLine ? `${line}...` : line,
      x,
      y + index * lineHeight,
    );
  });
};

export const drawRoutineImage = (
  plan: BulkOfferedSubjectSchedulePlan,
  blocks: AssignmentBlock[],
  instructors: Instructor[],
) => {
  const { blocks: exportBlocks, periods, days } = buildRoutineExportData(
    plan,
    blocks,
    instructors,
  );
  if (periods.length === 0) {
    throw new Error("No scheduled periods available for export.");
  }

  const leftColumnWidth = 150;
  const periodColumnWidth = 220;
  const headerHeight = 88;
  const rowHeight = 208;
  const outerPadding = 36;
  const titleHeight = 92;
  const footerHeight = 68;
  const canvasWidth =
    outerPadding * 2 + leftColumnWidth + periods.length * periodColumnWidth;
  const canvasHeight =
    outerPadding * 2 + titleHeight + headerHeight + days.length * rowHeight + footerHeight;

  const canvas = document.createElement("canvas");
  const deviceScale = 2;
  canvas.width = canvasWidth * deviceScale;
  canvas.height = canvasHeight * deviceScale;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not initialize canvas context.");
  }

  context.scale(deviceScale, deviceScale);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvasWidth, canvasHeight);

  context.fillStyle = "#18181b";
  context.font = "700 30px Arial";
  context.fillText("AI Suggested Routine", outerPadding, outerPadding + 26);

  context.fillStyle = "#71717a";
  context.font = "500 16px Arial";
  context.fillText(
    `${plan.plans.length} subjects planned`,
    outerPadding,
    outerPadding + 58,
  );

  const gridX = outerPadding;
  const gridY = outerPadding + titleHeight;
  const gridWidth = leftColumnWidth + periods.length * periodColumnWidth;
  const gridHeight = headerHeight + days.length * rowHeight;

  drawRoundedRect(context, gridX, gridY, gridWidth, gridHeight, 24, "#fafafa", "#e4e4e7");

  context.fillStyle = "#f4f4f5";
  context.fillRect(gridX, gridY, leftColumnWidth, gridHeight);
  context.fillRect(gridX, gridY, gridWidth, headerHeight);

  context.strokeStyle = "#e4e4e7";
  context.lineWidth = 2;

  for (let index = 0; index <= periods.length; index += 1) {
    const x = gridX + leftColumnWidth + index * periodColumnWidth;
    context.beginPath();
    context.moveTo(x, gridY);
    context.lineTo(x, gridY + gridHeight);
    context.stroke();
  }

  for (let index = 0; index <= days.length; index += 1) {
    const y = gridY + headerHeight + index * rowHeight;
    context.beginPath();
    context.moveTo(gridX, y);
    context.lineTo(gridX + gridWidth, y);
    context.stroke();
  }

  context.beginPath();
  context.moveTo(gridX + leftColumnWidth, gridY);
  context.lineTo(gridX + leftColumnWidth, gridY + gridHeight);
  context.stroke();

  context.fillStyle = "#71717a";
  context.font = "700 14px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("DAY / PERIOD", gridX + leftColumnWidth / 2, gridY + headerHeight / 2);

  periods.forEach((period, index) => {
    const centerX =
      gridX + leftColumnWidth + index * periodColumnWidth + periodColumnWidth / 2;
    context.fillText(`PERIOD ${period}`, centerX, gridY + headerHeight / 2);
  });

  days.forEach((day, dayIndex) => {
    const centerY = gridY + headerHeight + dayIndex * rowHeight + rowHeight / 2;
    context.fillText(day, gridX + leftColumnWidth / 2, centerY);
  });

  context.textAlign = "left";
  context.textBaseline = "top";

  days.forEach((day, dayIndex) => {
    const dayBlocks = exportBlocks.filter((block) => block.day === day);
    dayBlocks.forEach((block) => {
      const periodStartIndex = periods.indexOf(block.startPeriod);
      if (periodStartIndex === -1) return;

      const cellX = gridX + leftColumnWidth + periodStartIndex * periodColumnWidth + 10;
      const cellY = gridY + headerHeight + dayIndex * rowHeight + 10;
      const cellWidth = block.periodCount * periodColumnWidth - 20;
      const cellHeight = rowHeight - 20;
      const fillColor = block.classType === "practical" ? "#faf5ff" : "#eff6ff";
      const strokeColor = block.classType === "practical" ? "#c084fc" : "#60a5fa";
      const badgeFill = block.classType === "practical" ? "#a855f7" : "#2563eb";

      drawRoundedRect(
        context,
        cellX,
        cellY,
        cellWidth,
        cellHeight,
        18,
        fillColor,
        strokeColor,
      );

      drawRoundedRect(
        context,
        cellX + cellWidth - 88,
        cellY + 14,
        72,
        28,
        10,
        badgeFill,
      );

      context.fillStyle = "#ffffff";
      context.font = "700 12px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(
        block.classType === "practical" ? "LAB" : "THEORY",
        cellX + cellWidth - 52,
        cellY + 28,
      );

      context.textAlign = "left";
      context.textBaseline = "top";
      context.fillStyle = "#18181b";
      context.font = "700 18px Arial";
      drawWrappedText(
        context,
        block.subjectTitle,
        cellX + 16,
        cellY + 18,
        cellWidth - 120,
        22,
        2,
      );

      context.font = "600 14px Arial";
      context.fillStyle = "#334155";
      drawWrappedText(
        context,
        block.instructorName,
        cellX + 16,
        cellY + 78,
        cellWidth - 32,
        18,
        1,
      );

      context.font = "500 13px Arial";
      context.fillStyle = "#52525b";
      drawWrappedText(
        context,
        `${block.startTimeSnapshot} - ${block.endTimeSnapshot}`,
        cellX + 16,
        cellY + 108,
        cellWidth - 32,
        18,
        1,
      );

      drawWrappedText(
        context,
        `Room ${getRoomLabelDisplay(block.roomLabel)}`,
        cellX + 16,
        cellY + 132,
        cellWidth - 32,
        18,
        1,
      );

      context.font = "700 12px Arial";
      context.fillStyle = "#71717a";
      context.fillText(
        `P${block.startPeriod}${block.periodCount > 1 ? `-${block.startPeriod + block.periodCount - 1}` : ""}`,
        cellX + 16,
        cellY + cellHeight - 28,
      );
    });
  });

  context.fillStyle = "#71717a";
  context.font = "600 14px Arial";
  context.fillText(
    "Theory: blue cards  |  Lab / Practical: violet cards",
    outerPadding,
    canvasHeight - outerPadding - 24,
  );

  return canvas;
};

export function RoutineView({
  plan,
  blocks,
  instructors,
  containerRef,
}: {
  plan: BulkOfferedSubjectSchedulePlan;
  blocks: AssignmentBlock[];
  instructors: Instructor[];
  containerRef?: RefObject<HTMLDivElement | null>;
}) {
  const { blocks: routineBlocks, periods, days } = buildRoutineExportData(
    plan,
    blocks,
    instructors,
  );

  if (periods.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="mt-6 overflow-x-auto rounded-xl border border-(--line) bg-(--surface) shadow-sm custom-scrollbar p-1"
    >
      <table className="w-full min-w-300 border-collapse text-left table-fixed">
        <thead>
          <tr className="bg-(--surface-muted)/50">
            <th className="sticky left-0 z-20 w-28 border-b border-r border-(--line) bg-(--surface-muted) p-4 text-center text-[11px] font-black uppercase tracking-widest text-(--text-dim)">
              Day \ Period
            </th>
            {periods.map((period) => (
              <th
                key={period}
                className="border-b border-r border-(--line) p-4 text-center text-[11px] font-black tracking-widest text-(--text-dim) last:border-r-0"
              >
                PERIOD {period}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const dayBlocks = routineBlocks.filter((block) => block.day === day);
            const renderedPeriods = new Set<number>();

            return (
              <tr
                key={day}
                className="border-b border-(--line) last:border-0 hover:bg-(--surface-muted)/10 transition-colors"
              >
                <td className="sticky left-0 z-10 border-r border-(--line) bg-(--surface-muted) p-4 text-center text-sm font-bold uppercase tracking-wider text-(--text-dim)">
                  {day}
                </td>
                {periods.map((period) => {
                  if (renderedPeriods.has(period)) {
                    return null;
                  }

                  const block = dayBlocks.find((item) => item.startPeriod === period);

                  if (!block) {
                    renderedPeriods.add(period);
                    return (
                      <td
                        key={period}
                        className="border-r border-(--line) p-2 h-36 bg-(--surface-muted)/5 last:border-r-0"
                      />
                    );
                  }

                  block.periodNumbers.forEach((value) => renderedPeriods.add(value));

                  return (
                    <td
                      key={period}
                      colSpan={block.periodCount}
                      className="border-r border-(--line) p-2 align-top last:border-r-0"
                    >
                      <div
                        className={`group relative flex h-full min-h-36 flex-col rounded-xl border p-3.5 shadow-sm transition-all hover:shadow-md ${
                          block.classType === "practical"
                            ? "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50"
                            : "border-(--accent)/30 bg-(--accent)/5 hover:border-(--accent)/50"
                        }`}
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-bold leading-tight text-(--text) group-hover:text-(--accent) transition-colors line-clamp-3">
                              {block.subjectTitle}
                            </h4>
                            <span
                              className={`shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                block.classType === "practical"
                                  ? "bg-purple-500/10 text-purple-600"
                                  : "bg-(--accent)/10 text-(--accent)"
                              }`}
                            >
                              {block.classType === "practical" ? "Lab" : "Theory"}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[11px] font-bold text-(--text) flex items-center gap-2">
                              <svg
                                className="w-3.5 h-3.5 text-(--accent)"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2.5}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              {block.instructorName}
                            </p>
                            <p className="text-[10px] font-semibold text-(--text-dim) flex items-center gap-2">
                              <svg
                                className="w-3.5 h-3.5 opacity-60"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {block.startTimeSnapshot} - {block.endTimeSnapshot}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-2.5 border-t border-(--line)/40 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-(--text-dim)">
                            <svg
                              className="w-3.5 h-3.5 opacity-60"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                              />
                            </svg>
                            {getRoomLabelDisplay(block.roomLabel)}
                          </div>
                          <span className="text-[10px] font-black text-(--text-dim)/40">
                            P{block.startPeriod}
                            {block.periodCount > 1
                              ? `-${block.startPeriod + block.periodCount - 1}`
                              : ""}
                          </span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
