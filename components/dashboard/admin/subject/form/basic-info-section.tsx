"use client";

import { SubjectFormState } from "@/lib/type/dashboard/admin/subject/ui";
import { subjectTypeOptions } from "@/utils/dashboard/admin/subject/constants";

interface BasicInfoSectionProps {
  form: SubjectFormState;
  updateField: <T extends keyof SubjectFormState>(key: T, value: SubjectFormState[T]) => void;
}

export function BasicInfoSection({ form, updateField }: BasicInfoSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Title
        </label>
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="e.g. Data Structures and Algorithms"
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Prefix
        </label>
        <input
          value={form.prefix}
          onChange={(event) => updateField("prefix", event.target.value)}
          placeholder="e.g. CSE"
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Code
        </label>
        <input
          value={form.code}
          onChange={(event) => updateField("code", event.target.value)}
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
          type="number"
          min="1"
          placeholder="e.g. 2101"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Credits
        </label>
        <input
          value={form.credits}
          onChange={(event) => updateField("credits", event.target.value)}
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
          type="number"
          min="0.5"
          step="0.5"
          placeholder="e.g. 3.0"
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Regulation
        </label>
        <input
          value={form.regulation}
          onChange={(event) => updateField("regulation", event.target.value)}
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
          type="number"
          min="2000"
          placeholder="e.g. 2022"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
          Subject Type
        </label>
        <select
          value={form.subjectType}
          onChange={(event) =>
            updateField("subjectType", event.target.value as SubjectFormState["subjectType"])
          }
          className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
        >
          {subjectTypeOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-(--surface)">
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
