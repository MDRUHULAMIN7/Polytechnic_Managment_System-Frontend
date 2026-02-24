"use client";

import type { UseFormReturn } from "react-hook-form";
import type {
  CurriculumAcademicDepartmentOption,
  CurriculumFormValues,
  CurriculumSemesterRegistrationOption,
  CurriculumSubjectOption,
} from "@/lib/types/pages/curriculum/curriculum.types";
import {
  calculateSelectedSubjectsCredit,
  resolveAcademicSemesterLabel,
  resolveSemesterRegistrationLabel,
  resolveSubjectOptionLabel,
} from "@/lib/utils/curriculum/curriculum-utils";

type CurriculumFormProps = {
  mode: "create" | "update";
  form: UseFormReturn<CurriculumFormValues>;
  onSubmit: ReturnType<UseFormReturn<CurriculumFormValues>["handleSubmit"]>;
  onCancel: () => void;
  submitLabel: "Create" | "Update";
  submittingLabel: "Creating..." | "Updating...";
  departments: CurriculumAcademicDepartmentOption[];
  semesterRegistrations: CurriculumSemesterRegistrationOption[];
  subjects: CurriculumSubjectOption[];
  optionsLoading: boolean;
};

export function CurriculumForm({
  mode,
  form,
  onSubmit,
  onCancel,
  submitLabel,
  submittingLabel,
  departments,
  semesterRegistrations,
  subjects,
  optionsLoading,
}: CurriculumFormProps) {
  const selectedSemesterRegistrationId = form.watch("semisterRegistration");
  const selectedSemesterRegistration = semesterRegistrations.find(
    (item) => item._id === selectedSemesterRegistrationId,
  );
  const selectedSubjectIds = form.watch("subjects") || [];
  const selectedSubjectsCredit = calculateSelectedSubjectsCredit(
    selectedSubjectIds,
    subjects,
  );

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Academic Department</label>
          <select
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
            {...form.register("academicDepartment", {
              required: "Academic department is required.",
            })}
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Loading options..." : "Select academic department"}
            </option>
            {departments.map((department) => (
              <option key={department._id} value={department._id}>
                {department.name}
              </option>
            ))}
          </select>
          {form.formState.errors.academicDepartment ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.academicDepartment.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Semester Registration</label>
          <select
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
            {...form.register("semisterRegistration", {
              required: "Semester registration is required.",
            })}
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Loading options..." : "Select semester registration"}
            </option>
            {semesterRegistrations.map((registration) => (
              <option key={registration._id} value={registration._id}>
                {resolveSemesterRegistrationLabel(registration)}
              </option>
            ))}
          </select>
          {form.formState.errors.semisterRegistration ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.semisterRegistration.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-(--line) bg-(--surface-2) px-3 py-2 text-xs text-(--text-dim)">
        <p>
          <span className="font-semibold">Academic Semester (auto):</span>{" "}
          {selectedSemesterRegistration
            ? resolveAcademicSemesterLabel(selectedSemesterRegistration.academicSemester)
            : "Select semester registration first"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Session (YYYY-YYYY)</label>
          <input
            type="text"
            placeholder="2025-2026"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
            {...form.register("session", { required: "Session is required." })}
          />
          {form.formState.errors.session ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.session.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Regulation</label>
          <input
            type="number"
            min={1}
            step={1}
            placeholder="e.g. 2022"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
            {...form.register("regulation", {
              required: "Regulation is required.",
            })}
          />
          {form.formState.errors.regulation ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.regulation.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Subjects</p>
          <p className="text-xs text-(--text-dim)">
            Selected: {selectedSubjectIds.length} | Credit Preview: {selectedSubjectsCredit}
          </p>
        </div>

        {subjects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-(--line) px-3 py-2 text-xs text-(--text-dim)">
            No subjects available.
          </p>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-(--line) p-2">
            {subjects.map((subject) => (
              <label
                key={subject._id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-(--surface-2)"
              >
                <input
                  type="checkbox"
                  value={subject._id}
                  className="h-4 w-4 rounded border-(--line)"
                  {...form.register("subjects")}
                />
                <span>{resolveSubjectOptionLabel(subject)}</span>
              </label>
            ))}
          </div>
        )}

        {form.formState.errors.subjects ? (
          <p className="mt-1 text-xs text-(--danger)">
            {form.formState.errors.subjects.message as string}
          </p>
        ) : null}
      </div>

      {mode === "update" ? (
        <p className="text-xs text-(--text-dim)">
          Update note: backend validation will run for selected subjects and may keep previously added subjects.
        </p>
      ) : null}

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
