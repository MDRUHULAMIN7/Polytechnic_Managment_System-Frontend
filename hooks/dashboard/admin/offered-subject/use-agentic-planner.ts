"use client";

import { useEffect, useRef, useState } from "react";
import type { BulkOfferedSubjectSchedulePlan } from "@/lib/type/dashboard/admin/offered-subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import { downloadRoutinePlanImage } from "@/components/dashboard/admin/offered-subject/agentic-planner-download";
import {
  buildBulkPlannerEntries,
  createEmptyAssignmentBlock,
  generateBulkRoutinePlan,
  loadAgenticPlannerSupportData,
  savePlannedOfferedSubjects,
} from "@/components/dashboard/admin/offered-subject/agentic-planner-service";
import { showToast } from "@/utils/common/toast";
import type {
  AgenticPlannerModalProps,
  AssignmentBlock,
  RoutineViewMode,
} from "@/components/dashboard/admin/offered-subject/agentic-planner-types";

type UseAgenticPlannerArgs = Pick<
  AgenticPlannerModalProps,
  | "open"
  | "onClose"
  | "onSaved"
  | "semesterRegistrationId"
  | "academicInstructorId"
  | "academicDepartmentId"
>;

export function useAgenticPlanner({
  open,
  onClose,
  onSaved,
  semesterRegistrationId,
  academicInstructorId,
  academicDepartmentId,
}: UseAgenticPlannerArgs) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [blocks, setBlocks] = useState<AssignmentBlock[]>([
    createEmptyAssignmentBlock(),
  ]);
  const [planResult, setPlanResult] =
    useState<BulkOfferedSubjectSchedulePlan | null>(null);
  const [viewMode, setViewMode] = useState<RoutineViewMode>("list");
  const [loading, setLoading] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [isDesktopRoutineEnabled, setIsDesktopRoutineEnabled] = useState(false);
  const inlineRoutineRef = useRef<HTMLDivElement>(null);
  const fullViewRoutineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoading(true);

    loadAgenticPlannerSupportData({
      academicDepartmentId,
      semesterRegistrationId,
    })
      .then(({ instructors: nextInstructors, subjects: nextSubjects }) => {
        setInstructors(nextInstructors);
        setSubjects(nextSubjects);
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

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const syncRoutineMode = () => setIsDesktopRoutineEnabled(mediaQuery.matches);

    syncRoutineMode();
    mediaQuery.addEventListener("change", syncRoutineMode);

    return () => mediaQuery.removeEventListener("change", syncRoutineMode);
  }, []);

  useEffect(() => {
    if (isDesktopRoutineEnabled) {
      return;
    }

    setViewMode("list");
    setIsFullView(false);
  }, [isDesktopRoutineEnabled]);

  const addBlock = () => {
    setBlocks((currentBlocks) => [...currentBlocks, createEmptyAssignmentBlock()]);
  };

  const removeBlock = (id: string) => {
    setBlocks((currentBlocks) =>
      currentBlocks.length > 1
        ? currentBlocks.filter((block) => block.id !== id)
        : currentBlocks,
    );
  };

  const updateBlock = (id: string, updates: Partial<AssignmentBlock>) => {
    setBlocks((currentBlocks) =>
      currentBlocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block,
      ),
    );
  };

  const handleCreatePlan = async () => {
    const entries = buildBulkPlannerEntries(blocks);

    if (entries.length === 0) {
      showToast({
        variant: "error",
        title: "No selections",
        description:
          "Please select both an instructor and a subject in at least one block.",
      });
      return;
    }

    setPlanning(true);
    setPlanResult(null);

    try {
      const result = await generateBulkRoutinePlan({
        semesterRegistrationId,
        academicInstructorId,
        academicDepartmentId,
        entries,
      });

      setPlanResult(result);
      setViewMode(isDesktopRoutineEnabled ? "routine" : "list");
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
    if (!planResult) {
      return;
    }

    setSaving(true);

    try {
      const successCount = await savePlannedOfferedSubjects({
        planResult,
        blocks,
        semesterRegistrationId,
        academicInstructorId,
        academicDepartmentId,
      });

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
    if (!isDesktopRoutineEnabled) {
      showToast({
        variant: "info",
        title: "Desktop Only",
        description: "Routine image download is available on desktop view.",
      });
      return;
    }

    if (!planResult) {
      showToast({
        variant: "error",
        title: "Download Failed",
        description: "Routine plan is not available.",
      });
      return;
    }

    showToast({
      variant: "info",
      title: "Generating Image...",
      description: "Please wait while we generate your routine image.",
    });

    try {
      downloadRoutinePlanImage({
        planResult,
        blocks,
        instructors,
      });

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

  return {
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
    openFullView: () => setIsFullView(true),
    closeFullView: () => setIsFullView(false),
    handleCreatePlan,
    handleSaveAll,
    downloadImage,
  };
}
