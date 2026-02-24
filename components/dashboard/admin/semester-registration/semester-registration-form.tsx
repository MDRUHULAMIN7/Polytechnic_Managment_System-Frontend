"use client";

import type { AcademicSemester } from "@/lib/api/types";
import type { SemesterRegistrationFormValues } from "@/lib/types/pages/semester-registration/semester-registration.types";
import {
  resolveSemesterOptionLabel,
  SEMESTER_REGISTRATION_SHIFTS,
  SEMESTER_REGISTRATION_STATUSES,
} from "@/lib/utils/semester-registration/semester-registration-utils";
import type { UseFormReturn } from "react-hook-form";

type SemesterRegistrationFormProps = {
  form: UseFormReturn<SemesterRegistrationFormValues>;
  onSubmit: ReturnType<
    UseFormReturn<SemesterRegistrationFormValues>["handleSubmit"]
  >;
  onCancel: () => void;
  submitLabel: "Create" | "Update";
  submittingLabel: "Creating..." | "Updating...";
  semesters: AcademicSemester[];
  semestersLoading: boolean;
};

export function SemesterRegistrationForm({
  form,
  onSubmit,
  onCancel,
  submitLabel,
  submittingLabel,
  semesters,
  semestersLoading,
}: SemesterRegistrationFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Academic Semester</label>
        <select
          className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
          {...form.register("academicSemester", {
            required: "Academic semester is required.",
          })}
          disabled={semestersLoading}
        >
          <option value="">
            {semestersLoading ? "Loading semesters..." : "Select semester"}
          </option>
          {semesters.map((semester) => (
            <option key={semester._id} value={semester._id}>
              {resolveSemesterOptionLabel(semester)}
            </option>
          ))}
        </select>
        {form.formState.errors.academicSemester ? (
          <p className="mt-1 text-xs text-(--danger)">
            {form.formState.errors.academicSemester.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
            {...form.register("status", { required: "Status is required." })}
          >
            <option value="">Select status</option>
            {SEMESTER_REGISTRATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {form.formState.errors.status ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.status.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Shift</label>
          <select
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
            {...form.register("shift", { required: "Shift is required." })}
          >
            <option value="">Select shift</option>
            {SEMESTER_REGISTRATION_SHIFTS.map((shift) => (
              <option key={shift} value={shift}>
                {shift}
              </option>
            ))}
          </select>
          {form.formState.errors.shift ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.shift.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Start Date</label>
          <input
            type="datetime-local"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
            {...form.register("startDate", {
              required: "Start date is required.",
            })}
          />
          {form.formState.errors.startDate ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.startDate.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">End Date</label>
          <input
            type="datetime-local"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
            {...form.register("endDate", { required: "End date is required." })}
          />
          {form.formState.errors.endDate ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.endDate.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Total Credit</label>
        <input
          type="number"
          min={1}
          step={1}
          className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
          placeholder="e.g. 22"
          {...form.register("totalCredit", {
            required: "Total credit is required.",
          })}
        />
        {form.formState.errors.totalCredit ? (
          <p className="mt-1 text-xs text-(--danger)">
            {form.formState.errors.totalCredit.message}
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
          disabled={form.formState.isSubmitting}
          className="focus-ring rounded-lg bg-(--primary) px-3 py-2 text-sm font-semibold text-(--primary-ink) disabled:opacity-65"
        >
          {form.formState.isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}
