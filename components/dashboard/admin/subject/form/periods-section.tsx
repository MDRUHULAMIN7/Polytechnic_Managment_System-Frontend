"use client";

import { SubjectFormState } from "@/lib/type/dashboard/admin/subject/ui";

interface PeriodsSectionProps {
  form: SubjectFormState;
  showTheoryPeriods: boolean;
  showPracticalPeriods: boolean;
  updateField: <T extends keyof SubjectFormState>(key: T, value: SubjectFormState[T]) => void;
}

export function PeriodsSection({
  form,
  showTheoryPeriods,
  showPracticalPeriods,
  updateField,
}: PeriodsSectionProps) {
  if (!showTheoryPeriods && !showPracticalPeriods) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {showTheoryPeriods ? (
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Theory Periods Per Week
          </label>
          <input
            value={form.theoryPeriodsPerWeek}
            onChange={(event) => updateField("theoryPeriodsPerWeek", event.target.value)}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            type="number"
            min="0"
          />
        </div>
      ) : null}
      {showPracticalPeriods ? (
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Practical Periods Per Week
          </label>
          <input
            value={form.practicalPeriodsPerWeek}
            onChange={(event) => updateField("practicalPeriodsPerWeek", event.target.value)}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            type="number"
            min="0"
          />
        </div>
      ) : null}
    </div>
  );
}
