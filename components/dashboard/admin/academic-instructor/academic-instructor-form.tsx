"use client";

import type { UseFormReturn } from "react-hook-form";
import type { AcademicInstructorFormValues } from "@/lib/types/pages/academic.types";

type AcademicInstructorFormProps = {
  form: UseFormReturn<AcademicInstructorFormValues>;
  onSubmit: ReturnType<UseFormReturn<AcademicInstructorFormValues>["handleSubmit"]>;
  onCancel: () => void;
  idPrefix: "create" | "update";
  submitLabel: "Create" | "Update";
  submittingLabel: "Creating..." | "Updating...";
};

export function AcademicInstructorForm({
  form,
  onSubmit,
  onCancel,
  idPrefix,
  submitLabel,
  submittingLabel,
}: AcademicInstructorFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label htmlFor={`${idPrefix}-name`} className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
          placeholder="Enter academic instructor name"
          {...form.register("name", {
            required: "Name is required.",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters.",
            },
          })}
        />
        {form.formState.errors.name ? (
          <p className="mt-1 text-xs text-(--danger)">{form.formState.errors.name.message}</p>
        ) : null}
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
