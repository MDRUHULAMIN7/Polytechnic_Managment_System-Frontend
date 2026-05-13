/**
 * Curriculum Planning - Step 2 Component
 * Subject & Instructor Assignment with Blocks
 */

"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import type { Subject } from "@/lib/type/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type {
  CurriculumPlanningBlock,
  CurriculumPlanningStep2Data,
} from "@/lib/type/dashboard/admin/curriculum-planning";

interface CurriculumPlanningStep2Props {
  supportData: {
    subjects: Subject[];
    instructors: Instructor[];
  };
  initialData?: CurriculumPlanningStep2Data;
  maxCapacity: number;
  onNext: (data: CurriculumPlanningStep2Data) => void;
  onBack: () => void;
  loading?: boolean;
  error?: string | null;
}

export function CurriculumPlanningStep2({
  supportData,
  initialData,
  maxCapacity,
  onNext,
  onBack,
  loading = false,
  error = null,
}: CurriculumPlanningStep2Props) {
  const [blocks, setBlocks] = useState<CurriculumPlanningBlock[]>(
    initialData?.blocks || [
      {
        id: "block-1",
        subjectId: "",
        instructorId: "",
        maxCapacity,
      },
    ],
  );

  function addBlock() {
    setBlocks([
      ...blocks,
      {
        id: `block-${Date.now()}-${Math.random()}`,
        subjectId: "",
        instructorId: "",
        maxCapacity,
      },
    ]);
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter((b) => b.id !== id));
  }

  function updateBlock(id: string, updates: Partial<CurriculumPlanningBlock>) {
    setBlocks(
      blocks.map((b) =>
        b.id === id ? { ...b, ...updates } : b,
      ),
    );
  }

  function isSubjectTaken(subjectId: string, currentBlockId: string) {
    return blocks.some(
      (block) => block.id !== currentBlockId && block.subjectId === subjectId,
    );
  }

  const isValid = blocks.length > 0 && blocks.every((b) => b.subjectId && b.instructorId);

  return (
    <div className="space-y-6 rounded-lg border border-(--line) bg-(--surface) p-6">
      <div>
        <h2 className="text-lg font-semibold text-(--text)">
          Step 2: Subject & Instructor Assignment
        </h2>
        <p className="mt-1 text-sm text-(--text-dim)">
          Create blocks and assign subjects and instructors. The number of blocks should match
          the number of subjects you want to offer.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-lg border border-(--line) bg-(--surface-alt) p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-medium text-(--text)">Block {index + 1}</h3>
              {blocks.length > 1 && (
                <button
                  onClick={() => removeBlock(block.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-(--text)">
                  Subject *
                </label>
                <select
                  value={block.subjectId}
                  onChange={(e) => updateBlock(block.id, { subjectId: e.target.value })}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-(--text) disabled:opacity-50"
                >
                  <option value="">Select subject...</option>
                  {supportData.subjects.map((subject) => (
                    <option
                      key={subject._id}
                      value={subject._id}
                      disabled={isSubjectTaken(subject._id, block.id)}
                    >
                      {subject.title} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm font-medium text-(--text)">
                  Instructor *
                </label>
                <select
                  value={block.instructorId}
                  onChange={(e) => updateBlock(block.id, { instructorId: e.target.value })}
                  disabled={loading}
                  className="mt-1 block w-full rounded-md border border-(--line) bg-(--surface) px-3 py-2 text-(--text) disabled:opacity-50"
                >
                  <option value="">Select instructor...</option>
                  {supportData.instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {[instructor.name.firstName, instructor.name.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Capacity */}
              <div>
                <label className="block text-sm font-medium text-(--text)">
                  Capacity
                </label>
                <input
                  type="number"
                  value={block.maxCapacity}
                  readOnly
                  disabled
                  className="mt-1 block w-full rounded-md border border-(--line) bg-(--surface-alt) px-3 py-2 text-(--text-dim) cursor-not-allowed"
                />
                <p className="mt-1 text-[10px] text-(--text-dim)">
                  Inherited from Step 1
                </p>
              </div>
            </div>

            {/* Subject Info */}
            {block.subjectId && (
              <div className="mt-3 rounded-md bg-(--surface) p-3 text-xs text-(--text-dim)">
                {(() => {
                  const subject = supportData.subjects.find((s) => s._id === block.subjectId);
                  if (!subject) return null;
                  return (
                    <div className="space-y-1">
                      <div>Type: {subject.subjectType}</div>
                      <div>Credits: {subject.credits}</div>
                      {(subject.theoryPeriodsPerWeek || subject.practicalPeriodsPerWeek) && (
                        <div>
                          Periods: Theory={subject.theoryPeriodsPerWeek || 0}, Practical=
                          {subject.practicalPeriodsPerWeek || 0}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={addBlock}
          disabled={loading}
          className="flex items-center gap-2 rounded-md border border-(--line) px-4 py-2 text-sm font-medium text-(--text) hover:bg-(--surface-alt) disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Block
        </button>
      </div>

      <div className="flex justify-between gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="rounded-md border border-(--line) px-4 py-2 text-sm font-medium text-(--text) hover:bg-(--surface-alt) disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={() => onNext({ blocks })}
          disabled={!isValid || loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Next: Execute Planning"}
        </button>
      </div>
    </div>
  );
}
