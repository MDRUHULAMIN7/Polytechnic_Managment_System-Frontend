"use client";

import { resolveName } from "@/utils/dashboard/admin/utils";
import type { AgenticPlannerAssignmentPanelProps } from "./agentic-planner-types";

export function AgenticPlannerAssignmentPanel({
  blocks,
  instructors,
  subjects,
  planning,
  onAddBlock,
  onRemoveBlock,
  onUpdateBlock,
  onCreatePlan,
}: AgenticPlannerAssignmentPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-(--line) bg-(--surface) p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-(--text-dim)">
            1. Instructor & Subject Assignment
          </h3>
          <button
            onClick={onAddBlock}
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
                onClick={() => onRemoveBlock(block.id)}
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
                    onChange={(event) =>
                      onUpdateBlock(block.id, {
                        instructorId: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-4 text-sm font-medium transition-all focus:border-(--accent) focus:outline-none focus:ring-4 focus:ring-(--accent)/5"
                  >
                    <option value="">Select Instructor</option>
                    {instructors.map((instructor) => (
                      <option key={instructor._id} value={instructor._id}>
                        {resolveName(instructor.name)}
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
                    onChange={(event) =>
                      onUpdateBlock(block.id, {
                        subjectId: event.target.value,
                      })
                    }
                    className="h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-4 text-sm font-medium transition-all focus:border-(--accent) focus:outline-none focus:ring-4 focus:ring-(--accent)/5"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => {
                      const isSelectedElsewhere = blocks.some(
                        (item) => item.id !== block.id && item.subjectId === subject._id,
                      );
                      if (isSelectedElsewhere) {
                        return null;
                      }

                      return (
                        <option key={subject._id} value={subject._id}>
                          {subject.title} ({subject.code})
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
                    onChange={(event) =>
                      onUpdateBlock(block.id, {
                        maxCapacity: Number.parseInt(event.target.value, 10) || 0,
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
        onClick={onCreatePlan}
        disabled={planning || blocks.every((block) => !block.instructorId || !block.subjectId)}
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
  );
}
