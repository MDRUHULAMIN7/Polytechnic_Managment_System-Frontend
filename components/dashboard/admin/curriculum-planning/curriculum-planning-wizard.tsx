/**
 * Curriculum Planning - Main Wizard Container
 */

"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useCurriculumPlanningWizard } from "@/hooks/dashboard/admin/curriculum-planning-wizard";
import { CurriculumPlanningStep1 } from "./step-1-setup";
import { CurriculumPlanningStep2 } from "./step-2-assignment";
import { CurriculumPlanningStep3 } from "./step-3-execution";
import {
  loadStep1SupportData,
  loadStep2SupportData,
} from "@/lib/api/dashboard/admin/curriculum-planning";
import type {
  CurriculumPlanningBlock,
  CurriculumPlanningStep1Data,
  CurriculumPlanningStep1SupportData,
  CurriculumPlanningStep2SupportData,
  CurriculumPlanExecutionResult,
} from "@/lib/type/dashboard/admin/curriculum-planning";

export interface CurriculumPlanningCompletionPayload {
  step1Data: CurriculumPlanningStep1Data;
  blocks: CurriculumPlanningBlock[];
  result: CurriculumPlanExecutionResult;
}

interface CurriculumPlanningWizardProps {
  onClose: () => void;
  onCompleted?: (payload: CurriculumPlanningCompletionPayload) => void;
}

export function CurriculumPlanningWizard({
  onClose,
  onCompleted,
}: CurriculumPlanningWizardProps) {
  const wizard = useCurriculumPlanningWizard();
  const {
    session,
    loading,
    error,
    setError,
    setLoading,
    setStep1Data: persistStep1Data,
    setStep2Data: persistStep2Data,
    clearStep2Data,
    goToStep2,
    goToStep3,
    goBackToStep1,
    goBackToStep2,
  } = wizard;
  const [step1Data, setStep1Data] = useState<CurriculumPlanningStep1SupportData | null>(null);
  const [step2Data, setStep2Data] = useState<CurriculumPlanningStep2SupportData | null>(null);

  // Load Step 1 data on mount
  useEffect(() => {
    loadStep1SupportData()
      .then(setStep1Data)
      .catch((err) => setError(err.message));
  }, [setError]);

  // Load Step 2 data when entering step 2
  useEffect(() => {
    if (session.step === 2 && session.step1Data && !step2Data) {
      setLoading(true);
      loadStep2SupportData(
        session.step1Data.academicDepartmentId,
        session.step1Data.semesterRegistrationId,
      )
        .then(setStep2Data)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [session.step, session.step1Data, setError, setLoading, step2Data]);

  const handleStep1Next = (data: CurriculumPlanningStep1Data) => {
    const departmentOrSemesterChanged =
      session.step1Data?.academicDepartmentId !== data.academicDepartmentId ||
      session.step1Data?.semesterRegistrationId !== data.semesterRegistrationId;

    if (departmentOrSemesterChanged) {
      setStep2Data(null);
      clearStep2Data();
    } else if (session.step1Data?.maxCapacity !== data.maxCapacity && session.step2Data) {
      // If only maxCapacity changed, update all existing blocks
      const updatedBlocks = session.step2Data.blocks.map((block) => ({
        ...block,
        maxCapacity: data.maxCapacity,
      }));
      persistStep2Data({ blocks: updatedBlocks });
    }

    persistStep1Data(data);
    goToStep2();
  };

  const handleStep2Next = (data: NonNullable<typeof session.step2Data>) => {
    persistStep2Data(data);
    goToStep3();
  };

  const handleStep3Complete = (result: CurriculumPlanExecutionResult) => {
    if (!session.step1Data || !session.step2Data) {
      return;
    }

    onCompleted?.({
      step1Data: session.step1Data,
      blocks: session.step2Data.blocks,
      result,
    });
  };

  return (
    <div className="flex flex-col bg-(--background)">
      {/* Header */}
      <div className="border-b border-(--line) bg-(--surface) px-6 py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-(--text)">AI Curriculum Planning</h1>
        </div>
        <p className="mt-1 text-sm text-(--text-dim)">
          Multi-step curriculum planning with conflict detection and resolution
        </p>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-(--line) bg-(--surface-alt) px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          <div className={`font-medium ${session.step >= 1 ? "text-blue-600" : "text-(--text-dim)"}`}>
            Step 1: Setup
          </div>
          <ChevronRight className="h-4 w-4 text-(--text-dim)" />
          <div className={`font-medium ${session.step >= 2 ? "text-blue-600" : "text-(--text-dim)"}`}>
            Step 2: Assignment
          </div>
          <ChevronRight className="h-4 w-4 text-(--text-dim)" />
          <div className={`font-medium ${session.step >= 3 ? "text-blue-600" : "text-(--text-dim)"}`}>
            Step 3: Execution
          </div>
        </div>
      </div>

        {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="mx-auto max-w-4xl">
          {session.step === 1 && step1Data && (
            <CurriculumPlanningStep1
              supportData={step1Data}
              initialData={session.step1Data}
              onNext={handleStep1Next}
              loading={loading}
              error={error}
            />
          )}

          {session.step === 2 && step2Data && session.step1Data && (
            <CurriculumPlanningStep2
              supportData={step2Data}
              initialData={session.step2Data}
              maxCapacity={session.step1Data.maxCapacity}
              onNext={handleStep2Next}
              onBack={goBackToStep1}
              loading={loading}
              error={error}
            />
          )}

          {session.step === 3 && session.step1Data && session.step2Data && (
              <CurriculumPlanningStep3
                step1Data={session.step1Data}
                blocks={session.step2Data.blocks}
                onBack={goBackToStep2}
                onComplete={handleStep3Complete}
              />
            )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-(--line) bg-(--surface) px-6 py-4">
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-(--line) px-4 py-2 text-sm font-medium text-(--text) hover:bg-(--surface-alt)"
          >
            Close Wizard
          </button>
        </div>
      </div>
    </div>
  );
}
