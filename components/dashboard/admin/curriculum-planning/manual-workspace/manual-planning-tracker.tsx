"use client";

import { useMemo } from "react";
import { X, LayoutGrid, BookOpen, UserRound, CheckCircle2, CircleDashed } from "lucide-react";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type {
  ManualWorkspaceDraftBlock,
  ManualPlanningSubject,
} from "@/lib/type/dashboard/admin/manual-curriculum-workspace";
import { resolveInstructorDisplayName } from "@/utils/dashboard/admin/instructor/resolve-display-name";

type PlanningStats = {
  subject: Subject;
  instructor: Instructor;
  theoryPlanned: number;
  theoryRequired: number;
  practicalPlanned: number;
  practicalRequired: number;
  totalPlanned: number;
  totalRequired: number;
  isComplete: boolean;
};

export function ManualPlanningTracker({
  subjects,
  instructors,
  plannedSubjects,
  draftBlocks,
  onRemovePlannedSubject,
  onSelectSubject,
  activeSubjectId,
  activeInstructorId,
}: {
  subjects: Subject[];
  instructors: Instructor[];
  plannedSubjects: ManualPlanningSubject[];
  draftBlocks: ManualWorkspaceDraftBlock[];
  onRemovePlannedSubject: (sId: string, iId: string) => void;
  onSelectSubject: (sId: string, iId: string) => void;
  activeSubjectId: string;
  activeInstructorId: string;
}) {
  const stats = useMemo(() => {
    return plannedSubjects.map((item) => {
      const subject = subjects.find((s) => s._id === item.subjectId);
      const instructor = instructors.find((i) => i._id === item.instructorId);
      if (!subject || !instructor) return null;

      const blocks = draftBlocks.filter(
        (b) => b.subjectId === item.subjectId && b.instructorId === item.instructorId
      );

      const theoryPlanned = blocks.filter((b) => b.classType === "theory").length;
      const practicalPlanned = blocks.filter((b) => b.classType === "practical").length;

      const theoryRequired = subject.theoryPeriodsPerWeek ?? 0;
      const practicalPeriods = subject.practicalPeriodsPerWeek ?? 0;
      const practicalRequired = Math.floor(practicalPeriods / 3); // 3 periods = 1 class

      const totalPlanned = theoryPlanned + practicalPlanned;
      const totalRequired = theoryRequired + practicalRequired;

      const isComplete = theoryPlanned === theoryRequired && practicalPlanned === practicalRequired;

      return {
        subject,
        instructor,
        theoryPlanned,
        theoryRequired,
        practicalPlanned,
        practicalRequired,
        totalPlanned,
        totalRequired,
        isComplete,
      } as PlanningStats;
    }).filter((s): s is PlanningStats => s !== null);
  }, [plannedSubjects, subjects, instructors, draftBlocks]);

  if (plannedSubjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-(--line) bg-(--surface-alt)/30 py-8 text-center">
        <LayoutGrid className="mb-2 h-8 w-8 text-(--text-dim) opacity-20" />
        <p className="text-sm font-medium text-(--text-dim)">
          No subjects added to planning session yet.
        </p>
        <p className="mt-1 text-xs text-(--text-dim)/60">
          Select a subject and instructor below and click &quot;Add to session&quot; to track progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-(--line) pb-2">
        <LayoutGrid className="h-4 w-4 text-(--accent)" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-(--text)">
          Planning Session Progress
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((item) => {
          const isActive = item.subject._id === activeSubjectId && item.instructor._id === activeInstructorId;
          
          return (
            <div
              key={`${item.subject._id}-${item.instructor._id}`}
              onClick={() => onSelectSubject(item.subject._id, item.instructor._id)}
              className={`group relative flex cursor-pointer flex-col rounded-xl border p-3 transition-all ${
                isActive
                  ? "border-(--accent) bg-(--accent)/5 ring-1 ring-(--accent)"
                  : "border-(--line) bg-(--surface-alt) hover:border-(--accent)/50 hover:bg-(--surface-muted)"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemovePlannedSubject(item.subject._id, item.instructor._id);
                }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-(--line) bg-(--surface) text-(--text-dim) opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>

              <div className="mb-3">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <BookOpen className="h-3 w-3 shrink-0 text-(--accent)" />
                  <p className="truncate text-xs font-bold text-(--text)">
                    {item.subject.title}
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-1.5 overflow-hidden">
                  <UserRound className="h-3 w-3 shrink-0 text-(--text-dim)" />
                  <p className="truncate text-[10px] font-medium text-(--text-dim)">
                    {resolveInstructorDisplayName(item.instructor.name)}
                  </p>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2">
                <div className={`flex flex-col rounded-lg border p-1.5 text-center ${
                  item.theoryPlanned === item.theoryRequired ? "border-emerald-500/30 bg-emerald-500/5" : "border-(--line) bg-(--surface)"
                }`}>
                  <span className="text-[8px] uppercase tracking-tighter text-(--text-dim)">Theory</span>
                  <span className={`text-xs font-bold ${
                    item.theoryPlanned === item.theoryRequired ? "text-emerald-400" : "text-(--text)"
                  }`}>
                    {item.theoryPlanned} / {item.theoryRequired}
                  </span>
                </div>
                <div className={`flex flex-col rounded-lg border p-1.5 text-center ${
                  item.practicalPlanned === item.practicalRequired ? "border-emerald-500/30 bg-emerald-500/5" : "border-(--line) bg-(--surface)"
                }`}>
                  <span className="text-[8px] uppercase tracking-tighter text-(--text-dim)">Practical</span>
                  <span className={`text-xs font-bold ${
                    item.practicalPlanned === item.practicalRequired ? "text-emerald-400" : "text-(--text)"
                  }`}>
                    {item.practicalPlanned} / {item.practicalRequired}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-(--line) pt-2">
                <div className="flex items-center gap-1">
                  {item.isComplete ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <CircleDashed className="h-3 w-3 text-amber-500" />
                  )}
                  <span className={`text-[9px] font-bold uppercase ${item.isComplete ? "text-emerald-500" : "text-amber-500"}`}>
                    {item.isComplete ? "Ready" : "In Progress"}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-(--text-dim)">
                  {Math.round((item.totalPlanned / item.totalRequired) * 100) || 0}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
