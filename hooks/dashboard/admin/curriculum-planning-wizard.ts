/**
 * Curriculum Planning - Wizard State Hook
 * Manages the state for the multi-step curriculum planning workflow
 */

"use client";

import { useCallback, useState } from "react";
import type {
  CurriculumPlanningSession,
  CurriculumPlanningStep1Data,
  CurriculumPlanningStep2Data,
  CurriculumPlanExecutionResult,
} from "@/lib/type/dashboard/admin/curriculum-planning";

function createInitialSession(): CurriculumPlanningSession {
  return {
    sessionId: `session-${Date.now()}`,
    step: 1,
    isPlanning: false,
    lastUpdated: new Date().toISOString(),
  };
}

export function useCurriculumPlanningWizard() {
  const [session, setSession] = useState<CurriculumPlanningSession>(createInitialSession);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 handlers
  const setStep1Data = useCallback((data: CurriculumPlanningStep1Data) => {
    setSession((prev) => ({
      ...prev,
      step1Data: data,
      lastUpdated: new Date().toISOString(),
    }));
    setError(null);
  }, []);

  const validateStep1 = useCallback((): boolean => {
    const { step1Data } = session;
    if (
      !step1Data?.academicInstructorId ||
      !step1Data?.academicDepartmentId ||
      !step1Data?.semesterRegistrationId ||
      !step1Data?.maxCapacity ||
      step1Data.maxCapacity < 1 ||
      step1Data.maxCapacity > 60
    ) {
      setError("Please complete all fields. Capacity must be between 1 and 60.");
      return false;
    }
    return true;
  }, [session]);

  const goToStep2 = useCallback(() => {
    if (validateStep1()) {
      setSession((prev) => ({
        ...prev,
        step: 2,
        lastUpdated: new Date().toISOString(),
      }));
    }
  }, [validateStep1]);

  // Step 2 handlers
  const setStep2Data = useCallback((data: CurriculumPlanningStep2Data) => {
    setSession((prev) => ({
      ...prev,
      step2Data: data,
      lastUpdated: new Date().toISOString(),
    }));
    setError(null);
  }, []);

  const validateStep2 = useCallback((): boolean => {
    const { step2Data } = session;
    if (!step2Data?.blocks || step2Data.blocks.length === 0) {
      setError("Please add at least one block with subject and instructor.");
      return false;
    }

    const hasInvalid = step2Data.blocks.some(
      (b) => !b.subjectId || !b.instructorId || b.maxCapacity < 1 || b.maxCapacity > 60,
    );
    if (hasInvalid) {
      setError("All blocks must have subject, instructor, and valid capacity (1-60).");
      return false;
    }

    return true;
  }, [session]);

  const goToStep3 = useCallback(() => {
    if (validateStep2()) {
      setSession((prev) => ({
        ...prev,
        step: 3,
        lastUpdated: new Date().toISOString(),
      }));
    }
  }, [validateStep2]);

  const goBackToStep1 = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      step: 1,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const clearStep2Data = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      step2Data: undefined,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const goBackToStep2 = useCallback(() => {
    setSession((prev) => ({
      ...prev,
      step: 2,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Step 3 - Planning execution
  const setPlanningInProgress = useCallback((isPlanning: boolean) => {
    setSession((prev) => ({
      ...prev,
      isPlanning,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const setExecutionResult = useCallback(
    (result: CurriculumPlanExecutionResult | undefined) => {
      setSession((prev) => ({
        ...prev,
        executionResult: result,
        isPlanning: false,
        lastUpdated: new Date().toISOString(),
      }));
    },
    [],
  );

  // Utility
  const reset = useCallback(() => {
    setSession(createInitialSession());
    setError(null);
  }, []);

  return {
    // State
    session,
    loading,
    error,

    // Step 1
    setStep1Data,
    validateStep1,
    goToStep2,

    // Step 2
    setStep2Data,
    clearStep2Data,
    validateStep2,
    goToStep3,
    goBackToStep1,
    goBackToStep2,

    // Step 3
    setPlanningInProgress,
    setExecutionResult,
    setError,

    // Utilities
    reset,
    setLoading,
  };
}
