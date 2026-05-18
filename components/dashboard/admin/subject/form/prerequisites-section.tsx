"use client";

import { Subject } from "@/lib/type/dashboard/admin/subject";

interface PrerequisitesSectionProps {
  loadingSubjects: boolean;
  subjectsError: string | null;
  availableSubjects: Subject[];
  selectedPrerequisiteIds: string[];
  selectedSubjectMap: Map<string, Subject>;
  renderSubjectLabel: (item: Subject) => string;
  togglePreReq: (id: string, checked: boolean) => void;
}

export function PrerequisitesSection({
  loadingSubjects,
  subjectsError,
  availableSubjects,
  selectedPrerequisiteIds,
  selectedSubjectMap,
  renderSubjectLabel,
  togglePreReq,
}: PrerequisitesSectionProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
        Prerequisites
      </p>
      {loadingSubjects ? (
        <p className="text-sm text-(--text-dim)">Loading subjects...</p>
      ) : subjectsError ? (
        <p className="text-sm text-red-400">{subjectsError}</p>
      ) : (
        <div className="space-y-4">
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-(--line) bg-(--surface) p-3 text-sm">
            {availableSubjects.length === 0 ? (
              <p className="text-(--text-dim)">No subjects available.</p>
            ) : (
              availableSubjects.map((item) => {
                const checked = selectedPrerequisiteIds.includes(item._id);
                return (
                  <label
                    key={item._id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border border-(--line) px-3 py-2 transition hover:border-(--accent)/50 ${
                      checked ? "bg-(--surface-muted)" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => togglePreReq(item._id, event.target.checked)}
                      className="h-4 w-4 accent-(--accent)"
                    />
                    <span className="font-medium">{renderSubjectLabel(item)}</span>
                  </label>
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Selected Prerequisites
            </p>
            {selectedPrerequisiteIds.length === 0 ? (
              <p className="text-sm text-(--text-dim)">No prerequisites selected.</p>
            ) : (
              selectedPrerequisiteIds.map((id) => {
                const item = selectedSubjectMap.get(id);
                const label = item ? renderSubjectLabel(item) : id;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-lg border border-(--line) px-3 py-2 text-sm"
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={() => togglePreReq(id, false)}
                      className="focus-ring inline-flex h-8 items-center justify-center rounded-lg border border-red-500/50 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
