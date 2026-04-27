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

  // Selections: instructorId -> { subjectIds: string[], maxCapacity: number }
  const [selections, setSelections] = useState<
    Record<string, { subjectIds: string[]; maxCapacity: number }>
  >({});

  const [planResult, setPlanResult] =
    useState<BulkOfferedSubjectSchedulePlan | null>(null);

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

  const toggleSubject = (instructorId: string, subjectId: string) => {
    setSelections((prev) => {
      const current = prev[instructorId] || { subjectIds: [], maxCapacity: 40 };
      const isSelected = current.subjectIds.includes(subjectId);

      const newSubjectIds = isSelected
        ? current.subjectIds.filter((id) => id !== subjectId)
        : [...current.subjectIds, subjectId];

      return {
        ...prev,
        [instructorId]: { ...current, subjectIds: newSubjectIds },
      };
    });
  };

  const updateMaxCapacity = (instructorId: string, capacity: number) => {
    setSelections((prev) => ({
      ...prev,
      [instructorId]: {
        ...(prev[instructorId] || { subjectIds: [], maxCapacity: 40 }),
        maxCapacity: capacity,
      },
    }));
  };

  const handleCreatePlan = async () => {
    const entries: BulkOfferedSubjectSchedulePlanEntry[] = [];

    Object.entries(selections).forEach(([instructorId, data]) => {
      data.subjectIds.forEach((subjectId) => {
        entries.push({
          subject: subjectId,
          instructor: instructorId,
          maxCapacity: data.maxCapacity,
        });
      });
    });

    if (entries.length === 0) {
      showToast({
        variant: "error",
        title: "No selections",
        description: "Please select at least one subject for an instructor.",
      });
      return;
    }

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
        // Find selection data for this subject/instructor pair
        let selectionData = null;
        for (const [instId, data] of Object.entries(selections)) {
          if (data.subjectIds.includes(plan.subjectId)) {
            // Need to make sure it's the right instructor too if subjects are assigned to multiple (rare)
            // But our UI assigns subject to one instructor at a time in the selection state.
            selectionData = {
              instructorId: instId,
              maxCapacity: data.maxCapacity,
            };
            break;
          }
        }

        if (!selectionData) continue;

        const payload: OfferedSubjectInput = {
          semesterRegistration: semesterRegistrationId,
          academicInstructor: academicInstructorId,
          academicDepartment: academicDepartmentId,
          subject: plan.subjectId,
          instructor: selectionData.instructorId,
          maxCapacity: selectionData.maxCapacity,
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

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Agentic AI Planner"
      description="Select instructors and assign subjects to generate an optimal schedule."
      maxWidth="max-w-6xl"
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-(--text-dim)">
                  1. Assign Subjects to Instructors
                </h3>

                <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {instructors.map((instructor) => (
                    <div
                      key={instructor._id}
                      className="rounded-xl border border-(--line) bg-(--surface-muted) p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-(--text)">
                            {resolveName(instructor.name)}
                          </p>
                          <p className="text-xs text-(--text-dim)">
                            {instructor.designation}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold uppercase text-(--text-dim)">
                            Cap
                          </label>
                          <input
                            type="number"
                            value={
                              selections[instructor._id]?.maxCapacity ?? 40
                            }
                            onChange={(e) =>
                              updateMaxCapacity(
                                instructor._id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="h-8 w-16 rounded-lg border border-(--line) bg-transparent px-2 text-sm focus:outline-none focus:ring-1 focus:ring-(--accent)"
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {subjects.map((subject) => {
                          const isSelected = selections[
                            instructor._id
                          ]?.subjectIds.includes(subject._id);
                          const isAssignedElsewhere = Object.entries(
                            selections,
                          ).some(
                            ([instId, data]) =>
                              instId !== instructor._id &&
                              data.subjectIds.includes(subject._id),
                          );

                          if (isAssignedElsewhere) return null;

                          return (
                            <button
                              key={subject._id}
                              onClick={() =>
                                toggleSubject(instructor._id, subject._id)
                              }
                              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                isSelected
                                  ? "bg-(--accent) text-(--accent-ink)"
                                  : "bg-(--surface) border border-(--line) text-(--text-dim) hover:border-(--accent)/50"
                              }`}
                            >
                              {subject.title}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreatePlan}
                disabled={
                  planning ||
                  Object.values(selections).every(
                    (s) => s.subjectIds.length === 0,
                  )
                }
                className="w-full rounded-xl bg-(--accent) py-3 font-bold text-(--accent-ink) transition-all hover:opacity-90 disabled:opacity-50"
              >
                {planning ? "AI is thinking..." : "Create Plan"}
              </button>
            </div>

            {/* Results Panel */}
            <div className="rounded-2xl border border-(--line) bg-(--surface) p-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-(--text-dim)">
                2. AI Suggested Plans
              </h3>

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
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
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
                              <span className="italic">{block.roomLabel}</span>
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
