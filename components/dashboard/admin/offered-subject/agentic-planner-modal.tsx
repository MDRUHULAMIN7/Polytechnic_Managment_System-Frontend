"use client";

import { useEffect, useState } from "react";
import { createOfferedSubjectAction } from "@/actions/dashboard/admin/offered-subject";
import { planBulkOfferedSubjectSchedule } from "@/lib/api/dashboard/admin/offered-subject";
import { getInstructors } from "@/lib/api/dashboard/admin/instructor";
import { getSubjects } from "@/lib/api/dashboard/admin/subject";
import { getOfferedSubjects } from "@/lib/api/dashboard/admin/offered-subject";
import type {
  BulkOfferedSubjectSchedulePlan,
  BulkOfferedSubjectSchedulePlanEntry,
  OfferedSubjectInput,
} from "@/lib/type/dashboard/admin/offered-subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import { resolveName } from "@/utils/dashboard/admin/utils";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";
import html2canvas from "html2canvas";
import { useRef } from "react";

interface AgenticPlannerModalProps {
  open: boolean;
  onClose: () => void;
  semesterRegistrationId: string;
  academicInstructorId: string;
  academicDepartmentId: string;
  onSaved: () => void;
}

export function AgenticPlannerModal({
  open,
  onClose,
  semesterRegistrationId,
  academicInstructorId,
  academicDepartmentId,
  onSaved,
}: AgenticPlannerModalProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [saving, setSaving] = useState(false);

  // Assignment Blocks: each block is one instructor + one subject
  interface AssignmentBlock {
    id: string;
    instructorId: string;
    subjectId: string;
    maxCapacity: number;
  }
  const [blocks, setBlocks] = useState<AssignmentBlock[]>([
    {
      id: crypto.randomUUID(),
      instructorId: "",
      subjectId: "",
      maxCapacity: 40,
    },
  ]);

  const [planResult, setPlanResult] =
    useState<BulkOfferedSubjectSchedulePlan | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "routine">("list");
  const [isFullView, setIsFullView] = useState(false);
  const routineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    Promise.all([
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
        limit: 1000,
        semesterRegistration: semesterRegistrationId,
      }),
    ])
      .then(([instructorData, subjectData, offeredData]) => {
        setInstructors(instructorData.result ?? []);

        // Filter out subjects already offered in this semester
        const offeredSubjectIds = new Set(
          (offeredData.result ?? [])
            .map((os) =>
              typeof os.subject === "string" ? os.subject : os.subject?._id,
            )
            .filter(Boolean),
        );

        setSubjects(
          (subjectData.result ?? []).filter(
            (s) => !offeredSubjectIds.has(s._id),
          ),
        );
      })
      .catch(() => {
        showToast({
          variant: "error",
          title: "Load Failed",
          description: "Failed to load instructors or subjects.",
        });
      })
      .finally(() => setLoading(false));
  }, [open, academicDepartmentId, semesterRegistrationId]);

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        instructorId: "",
        subjectId: "",
        maxCapacity: 40,
      },
    ]);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) =>
      prev.length > 1 ? prev.filter((b) => b.id !== id) : prev,
    );
  };

  const updateBlock = (id: string, updates: Partial<AssignmentBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
  };

  const handleCreatePlan = async () => {
    const validBlocks = blocks.filter((b) => b.instructorId && b.subjectId);

    if (validBlocks.length === 0) {
      showToast({
        variant: "error",
        title: "No selections",
        description:
          "Please select both an instructor and a subject in at least one block.",
      });
      return;
    }

    const entries: BulkOfferedSubjectSchedulePlanEntry[] = validBlocks.map(
      (b) => ({
        subject: b.subjectId,
        instructor: b.instructorId,
        maxCapacity: b.maxCapacity,
      }),
    );

    setPlanning(true);
    setPlanResult(null);
    try {
      const result = await planBulkOfferedSubjectSchedule({
        semesterRegistration: semesterRegistrationId,
        academicInstructor: academicInstructorId,
        academicDepartment: academicDepartmentId,
        entries,
      });
      setPlanResult(result);
      setViewMode("routine"); // Switch to routine view by default when plan is generated
      showToast({
        variant: "success",
        title: "Plan Generated",
        description: result.summary,
      });
    } catch (error) {
      showToast({
        variant: "error",
        title: "Planning Failed",
        description:
          error instanceof Error ? error.message : "Failed to generate plan",
      });
    } finally {
      setPlanning(false);
    }
  };

  const handleSaveAll = async () => {
    if (!planResult) return;

    setSaving(true);
    try {
      let successCount = 0;
      for (const plan of planResult.plans) {
        // Find the block for this subject
        const block = blocks.find((b) => b.subjectId === plan.subjectId);
        if (!block) continue;

        const payload: OfferedSubjectInput = {
          semesterRegistration: semesterRegistrationId,
          academicInstructor: academicInstructorId,
          academicDepartment: academicDepartmentId,
          subject: plan.subjectId,
          instructor: block.instructorId,
          maxCapacity: block.maxCapacity,
          scheduleBlocks: plan.suggestedBlocks.map((b) => ({
            classType: b.classType,
            day: b.day,
            room: b.room,
            startPeriod: b.startPeriod,
            periodCount: b.periodCount,
          })),
        };

        const result = await createOfferedSubjectAction(payload);
        if (result?._id) {
          successCount++;
        }
      }

      showToast({
        variant: "success",
        title: "Bulk Save Complete",
        description: `Successfully created ${successCount} offered subjects.`,
      });
      onSaved();
      onClose();
    } catch {
      showToast({
        variant: "error",
        title: "Save Failed",
        description: "An error occurred while saving plans.",
      });
    } finally {
      setSaving(false);
    }
  };

  const downloadImage = async () => {
    const routineElement = routineRef.current;
    if (!routineElement) {
      showToast({
        variant: "error",
        title: "Download Failed",
        description: "Routine view is not available.",
      });
      return;
    }

    showToast({
      variant: "info",
      title: "Generating Image...",
      description: "Please wait while we generate your routine image.",
    });

    try {
      const clone = routineElement.cloneNode(true) as HTMLElement;

      const cssVarReplacements: Record<string, string> = {
        "--surface": "#fafafa",
        "--surface-muted": "#f4f4f5",
        "--accent": "#2563eb",
        "--accent-ink": "#ffffff",
        "--text": "#18181b",
        "--text-dim": "#71717a",
        "--line": "#e4e4e7",
      };

      clone.querySelectorAll("*").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const styles = htmlEl.style;

        const newStyle: string[] = [];
        styles.cssText.split(";").forEach((prop) => {
          const [key, value] = prop.split(":").map((s) => s.trim());
          if (!key || !value) return;

          if (value.includes("oklab")) {
            const fallback =
              cssVarReplacements[key.replace("--", "")] || "#ffffff";
            newStyle.push(`${key}:${fallback}`);
          } else if (key.startsWith("--")) {
            const fallback = cssVarReplacements[key.replace("--", "")] || value;
            newStyle.push(`${key}:${fallback}`);
          } else {
            newStyle.push(`${key}:${value}`);
          }
        });

        styles.cssText = newStyle.join(";");
      });

      const canvas = await html2canvas(clone, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `routine-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      showToast({
        variant: "success",
        title: "Download Complete",
        description: "Your routine image has been downloaded.",
      });
    } catch (error) {
      console.error("Download failed:", error);
      showToast({
        variant: "error",
        title: "Download Failed",
        description: "Failed to generate image.",
      });
    }
  };

  const RoutineView = ({ plan }: { plan: BulkOfferedSubjectSchedulePlan }) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu"];

    // 1. Get all unique periods present in the plan
    const allBlocks = plan.plans.flatMap((p) => {
      // Find instructor for this subject from the blocks state
      const assignmentBlock = blocks.find((b) => b.subjectId === p.subjectId);
      const instructor = instructors.find(
        (i) => i._id === assignmentBlock?.instructorId,
      );
      const instructorName = instructor ? resolveName(instructor.name) : "N/A";

      return p.suggestedBlocks.map((b) => ({
        ...b,
        subjectTitle: p.planningMeta.subjectTitle,
        instructorName,
      }));
    });

    const periodInfo = Array.from(
      new Map(
        allBlocks.flatMap((b) =>
          b.periodNumbers.map((pNum) => {
            // For each period number, we might want to know its individual time if possible
            // but since we only have the block's total start/end, we'll just track period numbers.
            return [pNum, pNum];
          }),
        ),
      ).values(),
    ).sort((a, b) => a - b);

    if (periodInfo.length === 0) return null;

    const minPeriod = Math.min(...periodInfo);
    const maxPeriod = Math.max(...periodInfo);
    const totalPeriods = maxPeriod - minPeriod + 1;
    const periods = Array.from(
      { length: totalPeriods },
      (_, i) => minPeriod + i,
    );

    return (
      <div
        ref={routineRef}
        className="mt-6 overflow-x-auto rounded-xl border border-(--line) bg-(--surface) shadow-sm custom-scrollbar p-1"
      >
        <table className="w-full min-w-300 border-collapse text-left table-fixed">
          <thead>
            <tr className="bg-(--surface-muted)/50">
              <th className="sticky left-0 z-20 w-28 border-b border-r border-(--line) bg-(--surface-muted) p-4 text-center text-[11px] font-black uppercase tracking-widest text-(--text-dim)">
                Day \ Period
              </th>
              {periods.map((p) => (
                <th
                  key={p}
                  className="border-b border-r border-(--line) p-4 text-center text-[11px] font-black tracking-widest text-(--text-dim) last:border-r-0"
                >
                  PERIOD {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => {
              const dayBlocks = allBlocks.filter((b) => b.day === day);
              const renderedPeriods = new Set<number>();

              return (
                <tr
                  key={day}
                  className="border-b border-(--line) last:border-0 hover:bg-(--surface-muted)/10 transition-colors"
                >
                  <td className="sticky left-0 z-10 border-r border-(--line) bg-(--surface-muted) p-4 text-center text-sm font-bold uppercase tracking-wider text-(--text-dim)">
                    {day}
                  </td>
                  {periods.map((p) => {
                    if (renderedPeriods.has(p)) return null;

                    const block = dayBlocks.find((b) => b.startPeriod === p);

                    if (block) {
                      const colSpan = block.periodCount;
                      // Mark all periods in this block as rendered
                      block.periodNumbers.forEach((pn) =>
                        renderedPeriods.add(pn),
                      );

                      return (
                        <td
                          key={p}
                          colSpan={colSpan}
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
                                  {block.classType === "practical"
                                    ? "Lab"
                                    : "Theory"}
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
                                  {block.startTimeSnapshot} -{" "}
                                  {block.endTimeSnapshot}
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
                                {block.roomLabel
                                  .split("|")[2]
                                  .replace("Room", "")
                                  .trim()}
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
                    } else {
                      renderedPeriods.add(p);
                      return (
                        <td
                          key={p}
                          className="border-r border-(--line) p-2 h-36 bg-(--surface-muted)/5 last:border-r-0"
                        />
                      );
                    }
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agentic AI Planner"
      description="Select instructors and assign subjects to generate an optimal schedule."
      maxWidth="max-w-7xl"
    >
      <div className="flex flex-col gap-6 p-1">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-(--text-dim)">
              Loading instructors and subjects...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Selection Panel */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-(--line) bg-(--surface) p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-(--text-dim)">
                    1. Instructor & Subject Assignment
                  </h3>
                  <button
                    onClick={addBlock}
                    className="inline-flex h-8 items-center justify-center rounded-lg bg-(--accent)/10 px-3 text-xs font-bold text-(--accent) transition hover:bg-(--accent)/20"
                  >
                    + Add Block
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="group relative rounded-2xl border border-(--line) bg-(--surface-muted)/40 p-5 transition-all hover:bg-(--surface-muted)/60"
                    >
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/10 text-red-500 opacity-0 transition-all hover:bg-red-500 hover:text-white group-hover:opacity-100 shadow-sm"
                        title="Remove block"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>

                      <div className="mb-4 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--accent) text-[10px] font-black text-(--accent-ink)">
                          {index + 1}
                        </span>
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--text-dim)">
                          Assignment Block
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-(--text-dim) ml-1">
                            Instructor
                          </label>
                          <select
                            value={block.instructorId}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                instructorId: e.target.value,
                              })
                            }
                            className="h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-4 text-sm font-medium transition-all focus:border-(--accent) focus:outline-none focus:ring-4 focus:ring-(--accent)/5"
                          >
                            <option value="">Select Instructor</option>
                            {instructors.map((inst) => (
                              <option key={inst._id} value={inst._id}>
                                {resolveName(inst.name)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-(--text-dim) ml-1">
                            Subject
                          </label>
                          <select
                            value={block.subjectId}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                subjectId: e.target.value,
                              })
                            }
                            className="h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-4 text-sm font-medium transition-all focus:border-(--accent) focus:outline-none focus:ring-4 focus:ring-(--accent)/5"
                          >
                            <option value="">Select Subject</option>
                            {subjects.map((sub) => {
                              const isSelectedElsewhere = blocks.some(
                                (b) =>
                                  b.id !== block.id && b.subjectId === sub._id,
                              );
                              if (isSelectedElsewhere) return null;
                              return (
                                <option key={sub._id} value={sub._id}>
                                  {sub.title} ({sub.code})
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-(--text-dim) ml-1">
                          Max Student Capacity
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={block.maxCapacity}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                maxCapacity: parseInt(e.target.value) || 0,
                              })
                            }
                            className="h-11 w-full rounded-xl border border-(--line) bg-(--surface) pl-11 pr-4 text-sm font-medium transition-all focus:border-(--accent) focus:outline-none focus:ring-4 focus:ring-(--accent)/5"
                          />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-dim)">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreatePlan}
                disabled={
                  planning ||
                  blocks.every((b) => !b.instructorId || !b.subjectId)
                }
                className="group relative w-full overflow-hidden rounded-2xl bg-(--accent) py-4 font-black uppercase tracking-widest text-(--accent-ink) shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {planning ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      AI is thinking...
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Generate Optimized Plan
                    </>
                  )}
                </span>
                <div className="absolute inset-0 z-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </div>

            {/* Results Panel */}
            <div className="rounded-2xl border border-(--line) bg-(--surface) p-4 sm:p-6 shadow-sm flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--accent)/10 text-(--accent)">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-(--text-dim)">
                    2. AI Suggested Routine
                  </h3>
                </div>
                {planResult && (
                  <div className="flex items-center gap-3">
                    {viewMode === "routine" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsFullView(true)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--surface-muted) text-(--text-dim) border border-(--line) hover:text-(--accent) hover:border-(--accent)/50 transition-all shadow-sm"
                          title="Full View"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={downloadImage}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--surface-muted) text-(--text-dim) border border-(--line) hover:text-(--accent) hover:border-(--accent)/50 transition-all shadow-sm"
                          title="Download Image"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                    <div className="flex items-center rounded-xl bg-(--surface-muted) p-1 border border-(--line) shadow-inner">
                      <button
                        onClick={() => setViewMode("routine")}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          viewMode === "routine"
                            ? "bg-(--accent) text-(--accent-ink) shadow-md"
                            : "text-(--text-dim) hover:text-(--text)"
                        }`}
                      >
                        Routine
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                          viewMode === "list"
                            ? "bg-(--accent) text-(--accent-ink) shadow-md"
                            : "text-(--text-dim) hover:text-(--text)"
                        }`}
                      >
                        List
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {!planResult ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center py-20">
                  <div className="rounded-full bg-(--surface-muted) p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-(--text-dim)"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <p className="mt-4 font-medium text-(--text-dim)">
                    Assign subjects and click &quot;Create Plan&quot; <br /> to
                    see AI suggestions.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)] min-h-100 pr-1 custom-scrollbar">
                    {viewMode === "list" ? (
                      <div className="space-y-4">
                        {planResult.plans.map((plan) => (
                          <div
                            key={plan.subjectId}
                            className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-(--accent)">
                                {plan.planningMeta.subjectTitle}
                              </h4>
                              <span className="rounded-full bg-(--accent)/10 px-2 py-0.5 text-[10px] font-bold text-(--accent)">
                                {plan.planningMeta.credits} Credits
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-medium text-(--text)">
                              {plan.summary}
                            </p>

                            <div className="mt-3 space-y-2">
                              {plan.suggestedBlocks.map((block, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-[10px] text-(--text-dim)"
                                >
                                  <span className="rounded bg-(--surface) px-1.5 py-0.5 border border-(--line)">
                                    {block.day}
                                  </span>
                                  <span>
                                    {block.startTimeSnapshot} -{" "}
                                    {block.endTimeSnapshot}
                                  </span>
                                  <span className="italic">
                                    {block.roomLabel}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {plan.warnings.length > 0 && (
                              <div className="mt-3 rounded-lg bg-yellow-500/10 p-2">
                                <p className="text-[10px] text-yellow-600">
                                  ⚠️ {plan.warnings[0]}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <RoutineView plan={planResult} />
                    )}
                  </div>

                  <div className="mt-6 border-t border-(--line) pt-4 shrink-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-(--text)">
                        {planResult.plans.length} subjects planned
                      </p>
                      <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50 shadow-md hover:shadow-lg active:scale-95"
                      >
                        {saving ? "Saving..." : "Save All Plans"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full View Routine Overlay */}
      {isFullView && planResult && (
        <div className="fixed inset-0 z-100 flex flex-col bg-(--surface)/95 backdrop-blur-md p-4 sm:p-8 md:p-12 animate-in fade-in zoom-in duration-300">
          <div className="mx-auto w-full max-w-400 flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div className="flex items-center gap-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-(--accent)/10 text-(--accent) shadow-inner">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-(--text)">
                    Full Routine View
                  </h2>
                  <p className="text-base font-medium text-(--text-dim)">
                    AI Suggested schedule for {planResult.plans.length} subjects
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2.5 rounded-xl bg-(--accent) px-6 py-3 text-sm font-bold text-(--accent-ink) shadow-lg transition-all hover:scale-105 active:scale-95 hover:shadow-(--accent)/20"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download PNG
                </button>
                <button
                  onClick={() => setIsFullView(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-(--surface-muted) text-(--text-dim) border border-(--line) hover:text-red-500 hover:border-red-500/50 transition-all shadow-sm hover:bg-red-500/5"
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto rounded-3xl border border-(--line) bg-(--surface) p-4 shadow-2xl custom-scrollbar min-h-0">
              <div className="min-w-fit">
                <RoutineView plan={planResult} />
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-10 shrink-0 py-4 border-t border-(--line)/40">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-lg bg-(--accent)/20 border-2 border-(--accent)/40 shadow-sm" />
                <span className="text-xs font-black uppercase tracking-widest text-(--text-dim)">
                  Theory Class
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-lg bg-purple-500/20 border-2 border-purple-500/40 shadow-sm" />
                <span className="text-xs font-black uppercase tracking-widest text-(--text-dim)">
                  Lab / Practical
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
