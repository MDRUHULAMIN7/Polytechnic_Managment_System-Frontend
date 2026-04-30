"use client";

import { useAgenticPlanner } from "@/hooks/dashboard/admin/offered-subject/use-agentic-planner";
import { AgenticPlannerAssignmentPanel } from "./agentic-planner-assignment-panel";
import { AgenticPlannerResultsPanel } from "./agentic-planner-results-panel";
import type { AgenticPlannerModalProps } from "./agentic-planner-types";
import { Modal } from "./modal";

export function AgenticPlannerModal({
  open,
  onClose,
  semesterRegistrationId,
  academicInstructorId,
  academicDepartmentId,
  onSaved,
}: AgenticPlannerModalProps) {
  const {
    instructors,
    subjects,
    blocks,
    planResult,
    viewMode,
    loading,
    planning,
    saving,
    isFullView,
    isDesktopRoutineEnabled,
    inlineRoutineRef,
    fullViewRoutineRef,
    addBlock,
    removeBlock,
    updateBlock,
    setViewMode,
    openFullView,
    closeFullView,
    handleCreatePlan,
    handleSaveAll,
    downloadImage,
  } = useAgenticPlanner({
    open,
    onClose,
    onSaved,
    semesterRegistrationId,
    academicInstructorId,
    academicDepartmentId,
  });

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
            <p className="text-(--text-dim)">Loading instructors and subjects...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AgenticPlannerAssignmentPanel
              blocks={blocks}
              instructors={instructors}
              subjects={subjects}
              planning={planning}
              onAddBlock={addBlock}
              onRemoveBlock={removeBlock}
              onUpdateBlock={updateBlock}
              onCreatePlan={handleCreatePlan}
            />

            <AgenticPlannerResultsPanel
              blocks={blocks}
              instructors={instructors}
              planResult={planResult}
              viewMode={viewMode}
              isDesktopRoutineEnabled={isDesktopRoutineEnabled}
              isFullView={isFullView}
              saving={saving}
              inlineRoutineRef={inlineRoutineRef}
              fullViewRoutineRef={fullViewRoutineRef}
              onSetViewMode={setViewMode}
              onOpenFullView={openFullView}
              onCloseFullView={closeFullView}
              onDownload={downloadImage}
              onSaveAll={handleSaveAll}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
