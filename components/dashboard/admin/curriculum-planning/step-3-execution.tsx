/**
 * Curriculum Planning - Step 3 Component
 * Planning Execution with Progress, Conflicts, and Results
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import type {
  CurriculumPlanExecutionResult,
  CurriculumPlanningBlock,
  CurriculumPlanningStep1Data,
} from "@/lib/type/dashboard/admin/curriculum-planning";
import {
  executeCurriculumPlanningAPI,
  savePlannedOfferedSubjects,
} from "@/lib/api/dashboard/admin/curriculum-planning";
import { showToast } from "@/utils/common/toast";
import { CurriculumPlanResults } from "./curriculum-plan-results";

interface CurriculumPlanningStep3Props {
  step1Data: CurriculumPlanningStep1Data;
  blocks: CurriculumPlanningBlock[];
  onBack: () => void;
  onComplete: (result: CurriculumPlanExecutionResult) => void;
}

export function CurriculumPlanningStep3({
  step1Data,
  blocks,
  onBack,
  onComplete,
}: CurriculumPlanningStep3Props) {
  const [progress, setProgress] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<CurriculumPlanExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executePlanning = useCallback(async () => {
    try {
      setExecuting(true);
      setError(null);
      setProgress(0);

      const planResult = await executeCurriculumPlanningAPI(
        step1Data.semesterRegistrationId,
        step1Data.academicInstructorId,
        step1Data.academicDepartmentId,
        blocks,
        (completed, total) => {
          setProgress(Math.round((completed / total) * 100));
        },
      );

      setResult(planResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to execute planning");
    } finally {
      setExecuting(false);
    }
  }, [blocks, step1Data]);

  useEffect(() => {
    void executePlanning();
  }, [executePlanning]);

  async function handleSaveResults(finalResult: CurriculumPlanExecutionResult) {
    if (
      finalResult.summary.failedBlocks > 0 ||
      finalResult.summary.totalConflicts.length > 0
    ) {
      showToast({
        variant: "error",
        title: "Conflict-free result required",
        description:
          finalResult.summary.totalConflicts[0]?.message ??
          "Resolve all failed blocks and conflicts before saving the plan.",
      });
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const saveResult = await savePlannedOfferedSubjects(
        step1Data.semesterRegistrationId,
        step1Data.academicInstructorId,
        step1Data.academicDepartmentId,
        finalResult,
        blocks,
      );

      onComplete({
        ...finalResult,
        createdOfferedSubjects: saveResult.createdIds,
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Save Failed",
        description: err instanceof Error ? err.message : "Failed to save results",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!result) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100"
      >
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 mb-4">
            <RefreshCcw className={`h-8 w-8 ${executing ? "animate-spin" : ""}`} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            AI Planning Engine
          </h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
            The system is currently analyzing {blocks.length} blocks to generate an optimized, conflict-free routine.
          </p>
        </div>

        {error && (
          <div className="rounded-3xl bg-red-50 border border-red-100 p-5 flex gap-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Status</span>
            <span className="text-sm font-black text-blue-600">{progress}% Complete</span>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-slate-100 p-1">
            <motion.div
              className="h-full bg-blue-600 rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={onBack}
            disabled={executing}
            className="flex-1 h-14 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            Go Back
          </button>
          <button
            onClick={executePlanning}
            disabled={executing}
            className="flex-2 h-14 rounded-2xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {executing ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : "Retry Execution"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {saving && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl flex flex-col items-center gap-4">
            <RefreshCcw className="h-10 w-10 text-blue-600 animate-spin" />
            <p className="font-bold text-slate-900">Saving Final Routine...</p>
          </div>
        </div>
      )}
      
      <CurriculumPlanResults
        step1Data={step1Data}
        blocks={blocks}
        result={result}
        onCreateAnother={onBack}
        onBackToOfferedSubjects={onBack}
        onFinalSave={handleSaveResults}
        isPreSave={true}
      />
    </div>
  );
}
