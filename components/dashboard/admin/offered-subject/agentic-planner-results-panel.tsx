"use client";

import { RoutineView } from "./agentic-planner-routine";
import type { AgenticPlannerResultsPanelProps } from "./agentic-planner-types";

function PlanList({
  planResult,
}: Pick<AgenticPlannerResultsPanelProps, "planResult">) {
  if (!planResult) {
    return null;
  }

  return (
    <div className="space-y-4">
      {planResult.plans.map((plan) => (
        <div
          key={plan.subjectId}
          className="rounded-xl border border-(--accent)/20 bg-(--surface-muted) p-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-(--accent)">{plan.planningMeta.subjectTitle}</h4>
            <span className="rounded-full bg-(--accent)/10 px-2 py-0.5 text-[10px] font-bold text-(--accent)">
              {plan.planningMeta.credits} Credits
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-(--text)">{plan.summary}</p>

          <div className="mt-3 space-y-2">
            {plan.suggestedBlocks.map((block, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-[10px] text-(--text-dim)"
              >
                <span className="rounded bg-(--surface) px-1.5 py-0.5 border border-(--line)">
                  {block.day}
                </span>
                <span>
                  {block.startTimeSnapshot} - {block.endTimeSnapshot}
                </span>
                <span className="italic">{block.roomLabel}</span>
              </div>
            ))}
          </div>

          {plan.warnings.length > 0 && (
            <div className="mt-3 rounded-lg bg-yellow-500/10 p-2">
              <p className="text-[10px] text-yellow-600">Warning: {plan.warnings[0]}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RoutineFullViewOverlay({
  blocks,
  instructors,
  planResult,
  fullViewRoutineRef,
  onDownload,
  onCloseFullView,
}: Pick<
  AgenticPlannerResultsPanelProps,
  | "blocks"
  | "instructors"
  | "planResult"
  | "fullViewRoutineRef"
  | "onDownload"
  | "onCloseFullView"
>) {
  if (!planResult) {
    return null;
  }

  return (
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
              onClick={onDownload}
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
              onClick={onCloseFullView}
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
            <RoutineView
              plan={planResult}
              blocks={blocks}
              instructors={instructors}
              containerRef={fullViewRoutineRef}
            />
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
  );
}

export function AgenticPlannerResultsPanel({
  blocks,
  instructors,
  planResult,
  viewMode,
  isDesktopRoutineEnabled,
  isFullView,
  saving,
  inlineRoutineRef,
  fullViewRoutineRef,
  onSetViewMode,
  onOpenFullView,
  onCloseFullView,
  onDownload,
  onSaveAll,
}: AgenticPlannerResultsPanelProps) {
  return (
    <>
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
              {isDesktopRoutineEnabled && viewMode === "routine" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={onOpenFullView}
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
                    onClick={onDownload}
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

              {isDesktopRoutineEnabled ? (
                <div className="flex items-center rounded-xl bg-(--surface-muted) p-1 border border-(--line) shadow-inner">
                  <button
                    onClick={() => onSetViewMode("routine")}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      viewMode === "routine"
                        ? "bg-(--accent) text-(--accent-ink) shadow-md"
                        : "text-(--text-dim) hover:text-(--text)"
                    }`}
                  >
                    Routine
                  </button>
                  <button
                    onClick={() => onSetViewMode("list")}
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                      viewMode === "list"
                        ? "bg-(--accent) text-(--accent-ink) shadow-md"
                        : "text-(--text-dim) hover:text-(--text)"
                    }`}
                  >
                    List
                  </button>
                </div>
              ) : (
                <span className="rounded-xl border border-(--line) bg-(--surface-muted) px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-(--text-dim)">
                  Mobile: list only
                </span>
              )}
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
              Assign subjects and click &quot;Create Plan&quot; <br /> to see AI suggestions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)] min-h-100 pr-1 custom-scrollbar">
              {viewMode === "list" || !isDesktopRoutineEnabled ? (
                <PlanList planResult={planResult} />
              ) : (
                <RoutineView
                  plan={planResult}
                  blocks={blocks}
                  instructors={instructors}
                  containerRef={inlineRoutineRef}
                />
              )}
            </div>

            <div className="mt-6 border-t border-(--line) pt-4 shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-(--text)">
                  {planResult.plans.length} subjects planned
                </p>
                <button
                  onClick={onSaveAll}
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

      {isFullView && planResult && isDesktopRoutineEnabled && (
        <RoutineFullViewOverlay
          blocks={blocks}
          instructors={instructors}
          planResult={planResult}
          fullViewRoutineRef={fullViewRoutineRef}
          onDownload={onDownload}
          onCloseFullView={onCloseFullView}
        />
      )}
    </>
  );
}
