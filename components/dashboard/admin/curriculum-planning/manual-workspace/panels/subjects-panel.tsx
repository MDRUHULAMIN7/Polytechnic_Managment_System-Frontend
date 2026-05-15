"use client";

import type { Subject } from "@/lib/type/dashboard/admin/subject";

export function SubjectsPanel({
  subjects,
  selectedSubjectId,
  onSelectSubject,
}: {
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubject: (id: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="mb-2 text-[11px] text-(--text-dim)">
        Subjects not yet offered this semester (same filter as planner step 2).
      </p>
      <ul className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
        {subjects.map((s) => (
          <li key={s._id}>
            <button
              type="button"
              onClick={() => onSelectSubject(s._id)}
              className={`w-full rounded-lg border px-2 py-2 text-left text-xs transition ${
                selectedSubjectId === s._id
                  ? "border-(--accent) bg-(--accent)/15 text-(--text)"
                  : "border-transparent hover:bg-(--surface-muted)"
              }`}
            >
              <span className="font-medium">{s.title}</span>
              <span className="ml-2 text-[10px] text-(--text-dim)">{s.code}</span>
              <div className="mt-0.5 text-[10px] text-(--text-dim)">
                {s.credits} cr
                {typeof s.theoryPeriodsPerWeek === "number" || typeof s.practicalPeriodsPerWeek === "number"
                  ? ` · Th ${s.theoryPeriodsPerWeek ?? 0} / Pr ${s.practicalPeriodsPerWeek ?? 0} per wk`
                  : null}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
