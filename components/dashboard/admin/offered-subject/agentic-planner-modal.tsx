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

  const RoutineView = ({ plan }: { plan: BulkOfferedSubjectSchedulePlan }) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu"];

    // 1. Get all unique periods present in the plan
    const allBlocks = plan.plans.flatMap((p) =>
      p.suggestedBlocks.map((b) => ({
        ...b,
        subjectTitle: p.planningMeta.subjectTitle,
      })),
    );

    const periodInfo = Array.from(
      new Map(
        allBlocks.flatMap((b) =>
          b.periodNumbers.map((pNum, idx) => {
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
      <div className="mt-4 overflow-x-auto rounded-xl border border-(--line) bg-(--surface)">
        <table className="w-full border-collapse text-left text-xs table-fixed">
          <thead>
            <tr className="bg-(--surface-muted)">
              <th className="border-b border-r border-(--line) p-3 font-bold uppercase tracking-wider text-(--text-dim) w-24">
                Day \ Period
              </th>
              {periods.map((p) => (
                <th
                  key={p}
                  className="border-b border-r border-(--line) p-3 font-bold text-(--text) text-center"
                >
                  P{p}
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
                  className="border-b border-(--line) last:border-0"
                >
                  <td className="border-r border-(--line) bg-(--surface-muted) p-3 font-bold uppercase text-(--text-dim)">
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
                          className="border-r border-(--line) p-2 align-top h-28"
                        >
                          <div
                            className={`h-full flex flex-col justify-between rounded-lg border p-2 shadow-sm transition-all hover:shadow-md ${
                              block.classType === "practical"
                                ? "border-purple-500/30 bg-purple-500/5"
                                : "border-(--accent)/30 bg-(--accent)/5"
                            }`}
                          >
                            <div>
                              <p className="font-bold text-(--text) line-clamp-2 leading-tight">
                                {block.subjectTitle}
                              </p>
                              <p className="mt-1 text-[9px] text-(--text-dim) font-medium">
                                {block.startTimeSnapshot} -{" "}
                                {block.endTimeSnapshot}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-1">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                                  block.classType === "practical"
                                    ? "bg-purple-500/10 text-purple-600"
                                    : "bg-(--accent)/10 text-(--accent)"
                                }`}
                              >
                                {block.classType === "practical"
                                  ? "LAB"
                                  : "THEORY"}
                              </span>
                              <span className="text-[8px] font-bold text-(--text-dim) truncate max-w-20">
                                {block.roomLabel.split("|")[2].trim()}
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
                          className="border-r border-(--line) p-2 h-28 bg-(--surface)/30"
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

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="group relative rounded-xl border border-(--line) bg-(--surface-muted) p-4 pt-6"
                    >
                      <button
                        onClick={() => removeBlock(block.id)}
                        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-md bg-red-500/10 text-red-500 transition hover:bg-red-500 group-hover:flex hover:text-white"
                        title="Remove block"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
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

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-(--text-dim)">
                            Instructor
                          </label>
                          <select
                            value={block.instructorId}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                instructorId: e.target.value,
                              })
                            }
                            className="h-10 w-full rounded-lg border border-(--line) bg-(--surface) px-3 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
                          >
                            <option value="">Select Instructor</option>
                            {instructors.map((inst) => (
                              <option key={inst._id} value={inst._id}>
                                {resolveName(inst.name)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-(--text-dim)">
                            Subject
                          </label>
                          <select
                            value={block.subjectId}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                subjectId: e.target.value,
                              })
                            }
                            className="h-10 w-full rounded-lg border border-(--line) bg-(--surface) px-3 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
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

                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-(--text-dim)">
                            Max Capacity
                          </label>
                          <input
                            type="number"
                            value={block.maxCapacity}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                maxCapacity: parseInt(e.target.value) || 0,
                              })
                            }
                            className="h-10 w-full rounded-lg border border-(--line) bg-(--surface) px-3 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
                          />
                        </div>
                        <div className="mt-auto h-10 flex items-center px-3 bg-(--surface) border border-(--line) rounded-lg">
                          <span className="text-[10px] font-bold uppercase text-(--text-dim)">
                            Block #{index + 1}
                          </span>
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
                className="w-full rounded-xl bg-(--accent) py-3 font-bold text-(--accent-ink) transition-all hover:opacity-90 disabled:opacity-50"
              >
                {planning ? "AI is thinking..." : "Create Plan"}
              </button>
            </div>

            {/* Results Panel */}
            <div className="rounded-2xl border border-(--line) bg-(--surface) p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-(--text-dim)">
                  2. AI Suggested Plans
                </h3>
                {planResult && (
                  <div className="flex items-center rounded-lg bg-(--surface-muted) p-1 border border-(--line)">
                    <button
                      onClick={() => setViewMode("routine")}
                      className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                        viewMode === "routine"
                          ? "bg-(--accent) text-(--accent-ink) shadow-sm"
                          : "text-(--text-dim) hover:text-(--text)"
                      }`}
                    >
                      Routine
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`rounded-md px-3 py-1 text-[10px] font-bold uppercase transition-all ${
                        viewMode === "list"
                          ? "bg-(--accent) text-(--accent-ink) shadow-sm"
                          : "text-(--text-dim) hover:text-(--text)"
                      }`}
                    >
                      List
                    </button>
                  </div>
                )}
              </div>

              {!planResult ? (
                <div className="flex h-full min-h-100 flex-col items-center justify-center text-center">
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
                <div className="mt-4 flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
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

                  <div className="mt-6 border-t border-(--line) pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-(--text)">
                        {planResult.plans.length} subjects planned
                      </p>
                      <button
                        onClick={handleSaveAll}
                        disabled={saving}
                        className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50"
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
    </Modal>
  );
}
