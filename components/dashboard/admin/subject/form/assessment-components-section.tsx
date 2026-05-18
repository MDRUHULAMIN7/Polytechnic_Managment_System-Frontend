"use client";

import {
  AssessmentBucket,
  AssessmentComponentType,
} from "@/lib/type/dashboard/admin/subject";
import {
  SubjectFormAssessmentComponentState,
  SubjectFormState,
} from "@/lib/type/dashboard/admin/subject/ui";
import {
  assessmentBucketOptions,
  componentTypeOptions,
} from "@/utils/dashboard/admin/subject/constants";
import { resolveDefaultComponentTypeForBucket } from "@/utils/dashboard/admin/subject/form";

interface AssessmentComponentsSectionProps {
  components: SubjectFormAssessmentComponentState[];
  addComponent: () => void;
  removeComponent: (index: number) => void;
  updateComponent: (
    index: number,
    key: keyof SubjectFormAssessmentComponentState,
    value: any
  ) => void;
}

export function AssessmentComponentsSection({
  components,
  addComponent,
  removeComponent,
  updateComponent,
}: AssessmentComponentsSectionProps) {
  return (
    <div className="rounded-2xl border border-(--line) bg-(--surface-muted) p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Assessment Components</p>
          <p className="text-xs text-(--text-dim)">
            Add the items instructors will use during marks entry.
          </p>
        </div>
        <button
          type="button"
          onClick={addComponent}
          className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) bg-(--surface) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
        >
          Add Component
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {components.map((component, index) => (
          <div
            key={`component-${index}`}
            className="rounded-2xl border border-(--line) bg-(--surface) p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Component {index + 1}</p>
                <p className="text-xs text-(--text-dim)">
                  e.g. Midterm, Attendance, Quiz 1.
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeComponent(index)}
                className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-red-500/50 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-10">
              <div className="lg:col-span-3">
                <label className="text-xs font-semibold text-(--text-dim)">Title</label>
                <input
                  value={component.title}
                  onChange={(event) => updateComponent(index, "title", event.target.value)}
                  className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  placeholder="Component Title"
                />
              </div>
              <div className="lg:col-span-3">
                <label className="text-xs font-semibold text-(--text-dim)">Bucket</label>
                <select
                  value={component.bucket}
                  onChange={(event) => {
                    const nextBucket = event.target.value as AssessmentBucket;
                    updateComponent(index, "bucket", nextBucket);
                    updateComponent(
                      index,
                      "componentType",
                      resolveDefaultComponentTypeForBucket(nextBucket)
                    );
                  }}
                  className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                >
                  {assessmentBucketOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-(--surface)">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-(--text-dim)">Full Marks</label>
                <input
                  value={component.fullMarks}
                  onChange={(event) => updateComponent(index, "fullMarks", event.target.value)}
                  className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                  type="number"
                  min="0"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs font-semibold text-(--text-dim)">Type</label>
                <select
                  value={component.componentType}
                  onChange={(event) =>
                    updateComponent(
                      index,
                      "componentType",
                      event.target.value as AssessmentComponentType
                    )
                  }
                  className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
                >
                  {componentTypeOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-(--surface)">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-(--text-dim)">
                <input
                  type="checkbox"
                  checked={component.isRequired}
                  onChange={(event) => updateComponent(index, "isRequired", event.target.checked)}
                  className="h-4 w-4 accent-(--accent)"
                />
                Mandatory for final result
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
