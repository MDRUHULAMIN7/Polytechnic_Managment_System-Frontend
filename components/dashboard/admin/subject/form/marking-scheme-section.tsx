"use client";

import { AssessmentBucket } from "@/lib/type/dashboard/admin/subject";
import { SubjectFormState } from "@/lib/type/dashboard/admin/subject/ui";

interface MarkingSchemeSectionProps {
  form: SubjectFormState;
  componentBucketTotals: Record<AssessmentBucket, number>;
  updateField: <T extends keyof SubjectFormState>(key: T, value: SubjectFormState[T]) => void;
}

export function MarkingSchemeSection({
  form,
  componentBucketTotals,
  updateField,
}: MarkingSchemeSectionProps) {
  const buckets = [
    { key: "theoryContinuous", label: "Theory Continuous", bucket: "THEORY_CONTINUOUS" },
    { key: "theoryFinal", label: "Theory Final", bucket: "THEORY_FINAL" },
    { key: "practicalContinuous", label: "Practical Continuous", bucket: "PRACTICAL_CONTINUOUS" },
    { key: "practicalFinal", label: "Practical Final", bucket: "PRACTICAL_FINAL" },
  ] as const;

  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface-muted) p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Official Marking Scheme</p>
          <p className="text-xs text-(--text-dim)">
            Define the fixed subject buckets from the curriculum.
          </p>
        </div>
        <div className="rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm">
          Total: <span className="font-semibold">{form.totalMarks}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {buckets.map(({ key, label, bucket }) => (
          <div key={key}>
            <label className="text-xs font-semibold text-(--text-dim)">{label}</label>
            <input
              value={form[key]}
              onChange={(event) => updateField(key, event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm"
              type="number"
              min="0"
            />
            <p className="mt-1 text-xs text-(--text-dim)">
              Component total:{" "}
              <span className="font-medium">
                {componentBucketTotals[bucket as AssessmentBucket] || 0}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
