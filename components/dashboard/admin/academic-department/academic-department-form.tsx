"use client";

import type { UseFormReturn } from "react-hook-form";
import type { AcademicInstructor } from "@/lib/api/types";
import type { AcademicDepartmentFormValues } from "@/lib/types/pages/academic.types";

type AcademicDepartmentFormProps = {
  form: UseFormReturn<AcademicDepartmentFormValues>;
  onSubmit: ReturnType<UseFormReturn<AcademicDepartmentFormValues>["handleSubmit"]>;
  onCancel: () => void;
  idPrefix: "create" | "update";
  submitLabel: "Create" | "Update";
  submittingLabel: "Creating..." | "Updating...";
  instructors: AcademicInstructor[];
  instructorsLoading: boolean;
};

export function AcademicDepartmentForm({
  form,
  onSubmit,
  onCancel,
  idPrefix,
  submitLabel,
  submittingLabel,
  instructors,
  instructorsLoading,
}: AcademicDepartmentFormProps) {
  const isInstructorSelectionUnavailable =
    instructorsLoading || instructors.length === 0;

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
          placeholder="Enter academic department name"
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

      <div>
        <label htmlFor={`${idPrefix}-instructor`} className="mb-1 block text-sm font-medium">
          Academic Instructor
        </label>
        <select
          id={`${idPrefix}-instructor`}
          className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm text-(--text) outline-none"
          disabled={isInstructorSelectionUnavailable}
          {...form.register("academicInstructor", {
            required: "Academic instructor is required.",
          })}
        >
          {instructorsLoading ? (
            <option value="" className="bg-(--surface) text-(--text)">
              Loading academic instructors...
            </option>
          ) : instructors.length === 0 ? (
            <option value="" className="bg-(--surface) text-(--text)">
              No academic instructors available
            </option>
          ) : (
            <>
              <option value="" className="bg-(--surface) text-(--text)">
                Select academic instructor
              </option>
              {instructors.map((instructor) => (
                <option
                  key={instructor._id}
                  value={instructor._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {instructor.name}
                </option>
              ))}
            </>
          )}
        </select>
        {form.formState.errors.academicInstructor ? (
          <p className="mt-1 text-xs text-(--danger)">
            {form.formState.errors.academicInstructor.message}
          </p>
        ) : null}
        {!instructorsLoading && instructors.length === 0 ? (
          <p className="mt-1 text-xs text-(--text-dim)">
            Create an academic instructor first, then create a department.
          </p>
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
          disabled={form.formState.isSubmitting || isInstructorSelectionUnavailable}
          className="focus-ring rounded-lg bg-(--primary) px-3 py-2 text-sm font-semibold text-(--primary-ink) disabled:opacity-65"
        >
          {form.formState.isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
