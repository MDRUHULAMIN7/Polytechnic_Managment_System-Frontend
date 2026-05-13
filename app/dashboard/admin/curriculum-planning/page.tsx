/**
 * Curriculum Planning Page
 * Dedicated page for AI-driven curriculum planning workflow
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, Sparkles, Wand2 } from "lucide-react";
import { showToast } from "@/utils/common/toast";
import { DashboardPageHeader } from "@/components/dashboard/shared/dashboard-page-header";
import {
  CurriculumPlanningWizard,
  type CurriculumPlanningCompletionPayload,
} from "@/components/dashboard/admin/curriculum-planning/curriculum-planning-wizard";
import { CurriculumPlanResults } from "@/components/dashboard/admin/curriculum-planning/curriculum-plan-results";

const PROCESS_STEPS = [
  {
    title: "Setup",
    description:
      "Select academic instructor, department, upcoming semester registration, and max capacity between 1 and 60.",
  },
  {
    title: "Assign Blocks",
    description:
      "Create one block per subject, then assign the subject and a department-filtered instructor for each block.",
  },
  {
    title: "Plan and Review",
    description:
      "Run the planner sequentially, inspect instructor and room conflicts, then save for instant admin editing.",
  },
];

export default function CurriculumPlanningPage() {
  const router = useRouter();
  const [completedPlan, setCompletedPlan] =
    useState<CurriculumPlanningCompletionPayload | null>(null);

  function handleWizardClose() {
    router.push("/dashboard/admin/offered-subjects");
  }

  function handlePlanCompleted(payload: CurriculumPlanningCompletionPayload) {
    setCompletedPlan(payload);
    showToast({
      variant: "success",
      title: "Curriculum plan saved",
      description: `Saved ${payload.result.createdOfferedSubjects.length} offered subject entries. You can review and edit them below.`,
    });
  }

  return (
    <section className="space-y-6">
      <DashboardPageHeader
        title="AI Curriculum Planning"
        description="Manual offered subjects stay on their own page. This page is dedicated to guided AI-assisted curriculum planning, conflict review, and instant post-plan editing."
        action={
          <Link
            href="/dashboard/admin/offered-subjects"
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-4 text-sm font-semibold text-(--text) transition hover:bg-(--surface-alt)"
          >
            <ArrowLeft className="h-4 w-4" />
            Back To Offered Subjects
          </Link>
        }
      />

      {!completedPlan ? (
        <>
          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-3xl border border-(--line) bg-linear-to-br from-(--surface) via-(--surface) to-(--surface-alt) p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--surface-alt) px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
                <Bot className="h-3.5 w-3.5" />
                Dedicated Planner
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-(--text)">
                Build the weekly routine in one focused workflow
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-(--text-dim)">
                The planner checks subject type, required periods, instructor availability,
                room suitability, and room occupancy before generating the routine. After
                saving, admin can immediately review and adjust the schedule from this same
                page.
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-xs text-(--text-dim)">
                <div className="rounded-full border border-(--line) px-3 py-1.5">
                  Conflict visibility for instructor and room schedules
                </div>
                <div className="rounded-full border border-(--line) px-3 py-1.5">
                  Sequential block-by-block planning
                </div>
                <div className="rounded-full border border-(--line) px-3 py-1.5">
                  Instant edit after save
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-(--line) bg-(--surface) p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--text)">
                <Sparkles className="h-4 w-4 text-(--accent)" />
                Planning Process
              </div>
              <div className="mt-4 space-y-4">
                {PROCESS_STEPS.map((step, index) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-(--line) bg-(--surface-alt) p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--accent) text-sm font-semibold text-(--accent-ink)">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-(--text)">{step.title}</p>
                        <p className="mt-1 text-xs leading-5 text-(--text-dim)">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-(--line) bg-(--surface) p-3 sm:p-5">
            <div className="mb-4 flex items-center gap-2 px-2 text-sm font-semibold text-(--text)">
              <Wand2 className="h-4 w-4 text-(--accent)" />
              Start Planning
            </div>
            <CurriculumPlanningWizard
              onClose={handleWizardClose}
              onCompleted={handlePlanCompleted}
            />
          </div>
        </>
      ) : (
        <CurriculumPlanResults
          step1Data={completedPlan.step1Data}
          blocks={completedPlan.blocks}
          result={completedPlan.result}
          onCreateAnother={() => setCompletedPlan(null)}
          onBackToOfferedSubjects={() => router.push("/dashboard/admin/offered-subjects")}
        />
      )}
    </section>
  );
}
