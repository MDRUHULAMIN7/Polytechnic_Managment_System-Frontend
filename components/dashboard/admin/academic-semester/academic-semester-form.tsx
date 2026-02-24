"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  ACADEMIC_SEMESTER_MONTHS,
  ACADEMIC_SEMESTER_NAMES,
} from "@/lib/utils/academic-semester/academic-semester-utils";
import type { AcademicSemesterFormValues } from "@/lib/types/pages/academic.types";

type AcademicSemesterFormProps = {
  form: UseFormReturn<AcademicSemesterFormValues>;
  code: string;
  onSubmit: ReturnType<UseFormReturn<AcademicSemesterFormValues>["handleSubmit"]>;
  onCancel: () => void;
  submitLabel: "Create" | "Update";
  submittingLabel: "Creating..." | "Updating...";
};

export function AcademicSemesterForm({
  form,
  code,
  onSubmit,
  onCancel,
  submitLabel,
  submittingLabel,
}: AcademicSemesterFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Semester Name</label>
          <select
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
            {...form.register("name", { required: "Semester name is required." })}
          >
            <option value="">Select semester</option>
            {ACADEMIC_SEMESTER_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {form.formState.errors.name ? (
            <p className="mt-1 text-xs text-(--danger)">{form.formState.errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Code</label>
          <input
            value={code}
            readOnly
            className="w-full rounded-xl border border-(--line) bg-(--surface-2) px-3 py-2 text-sm text-(--text-dim)"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Year</label>
        <input
          className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
          placeholder="e.g. 2026"
          {...form.register("year", {
            required: "Year is required.",
            pattern: { value: /^\d{4}$/, message: "Year must be 4 digits." },
          })}
        />
        {form.formState.errors.year ? (
          <p className="mt-1 text-xs text-(--danger)">{form.formState.errors.year.message}</p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Start Month</label>
          <select
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
            {...form.register("startMonth", { required: "Start month is required." })}
          >
            <option value="">Select start month</option>
            {ACADEMIC_SEMESTER_MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          {form.formState.errors.startMonth ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.startMonth.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">End Month</label>
          <select
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
            {...form.register("endMonth", { required: "End month is required." })}
          >
            <option value="">Select end month</option>
            {ACADEMIC_SEMESTER_MONTHS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          {form.formState.errors.endMonth ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.endMonth.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="focus-ring rounded-lg border border-(--line) px-3 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="focus-ring rounded-lg bg-(--primary) px-3 py-2 text-sm font-semibold text-(--primary-ink) disabled:opacity-65"
        >
          {form.formState.isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
