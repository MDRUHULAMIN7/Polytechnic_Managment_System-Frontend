"use client";

import type { UseFormReturn } from "react-hook-form";
import type { OfferedSubjectDay } from "@/lib/api/types";
import type {
  OfferedSubjectAcademicDepartmentOption,
  OfferedSubjectAcademicInstructorOption,
  OfferedSubjectFormValues,
  OfferedSubjectInstructorOption,
  OfferedSubjectSemesterRegistrationOption,
  OfferedSubjectSubjectOption,
} from "@/lib/types/pages/offered-subject/offered-subject.types";
import {
  OFFERED_SUBJECT_DAYS,
  resolveInstructorOptionLabel,
  resolveSemesterRegistrationOptionLabel,
  resolveSubjectOptionLabel,
} from "@/lib/utils/offered-subject/offered-subject-utils";

type OfferedSubjectFormProps = {
  mode: "create" | "update";
  form: UseFormReturn<OfferedSubjectFormValues>;
  onSubmit: ReturnType<UseFormReturn<OfferedSubjectFormValues>["handleSubmit"]>;
  onCancel: () => void;
  submitLabel: "Create" | "Update";
  submittingLabel: "Creating..." | "Updating...";
  subjects: OfferedSubjectSubjectOption[];
  instructors: OfferedSubjectInstructorOption[];
  academicDepartments: OfferedSubjectAcademicDepartmentOption[];
  academicInstructors: OfferedSubjectAcademicInstructorOption[];
  semesterRegistrations: OfferedSubjectSemesterRegistrationOption[];
  optionsLoading: boolean;
};

function isDayChecked(days: string[], value: OfferedSubjectDay) {
  return days.includes(value);
}

export function OfferedSubjectForm({
  mode,
  form,
  onSubmit,
  onCancel,
  submitLabel,
  submittingLabel,
  subjects,
  instructors,
  academicDepartments,
  academicInstructors,
  semesterRegistrations,
  optionsLoading,
}: OfferedSubjectFormProps) {
  const selectedDays = form.watch("days") || [];

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {mode === "create" ? (
        <>
          <div>
            <label className="mb-1 block text-sm font-medium">Semester Registration</label>
            <select
              className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
              {...form.register("semesterRegistration", {
                required: "Semester registration is required.",
              })}
              disabled={optionsLoading}
            >
              <option value="">
                {optionsLoading ? "Loading options..." : "Select semester registration"}
              </option>
              {semesterRegistrations.map((item) => (
                <option key={item._id} value={item._id}>
                  {resolveSemesterRegistrationOptionLabel(item)}
                </option>
              ))}
            </select>
            {form.formState.errors.semesterRegistration ? (
              <p className="mt-1 text-xs text-(--danger)">
                {form.formState.errors.semesterRegistration.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Academic Instructor</label>
              <select
                className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
                {...form.register("academicInstructor", {
                  required: "Academic instructor is required.",
                })}
                disabled={optionsLoading}
              >
                <option value="">
                  {optionsLoading ? "Loading options..." : "Select academic instructor"}
                </option>
                {academicInstructors.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.academicInstructor ? (
                <p className="mt-1 text-xs text-(--danger)">
                  {form.formState.errors.academicInstructor.message}
                </p>
              ) : null}
            </div>
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
                {academicDepartments.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.academicDepartment ? (
                <p className="mt-1 text-xs text-(--danger)">
                  {form.formState.errors.academicDepartment.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Subject</label>
              <select
                className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
                {...form.register("subject", { required: "Subject is required." })}
                disabled={optionsLoading}
              >
                <option value="">
                  {optionsLoading ? "Loading options..." : "Select subject"}
                </option>
                {subjects.map((item) => (
                  <option key={item._id} value={item._id}>
                    {resolveSubjectOptionLabel(item)}
                  </option>
                ))}
              </select>
              {form.formState.errors.subject ? (
                <p className="mt-1 text-xs text-(--danger)">
                  {form.formState.errors.subject.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Section</label>
              <input
                type="number"
                min={1}
                step={1}
                className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
                {...form.register("section", { required: "Section is required." })}
              />
              {form.formState.errors.section ? (
                <p className="mt-1 text-xs text-(--danger)">
                  {form.formState.errors.section.message}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Instructor</label>
          <select
            className="focus-ring w-full rounded-xl border border-(--line) bg-(--surface) px-3 py-2 text-sm"
            {...form.register("instructor", { required: "Instructor is required." })}
            disabled={optionsLoading}
          >
            <option value="">
              {optionsLoading ? "Loading options..." : "Select instructor"}
            </option>
            {instructors.map((item) => (
              <option key={item._id} value={item._id}>
                {resolveInstructorOptionLabel(item)}
              </option>
            ))}
          </select>
          {form.formState.errors.instructor ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.instructor.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Max Capacity</label>
          <input
            type="number"
            min={1}
            step={1}
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
            {...form.register("maxCapacity", {
              required: "Max capacity is required.",
            })}
          />
          {form.formState.errors.maxCapacity ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.maxCapacity.message}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <p className="mb-1 block text-sm font-medium">Days</p>
        <div className="grid grid-cols-2 gap-2 rounded-xl border border-(--line) p-2 sm:grid-cols-4">
          {OFFERED_SUBJECT_DAYS.map((day) => (
            <label key={day} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-(--surface-2)">
              <input
                type="checkbox"
                value={day}
                checked={isDayChecked(selectedDays, day)}
                onChange={(event) => {
                  const current = form.getValues("days") || [];
                  if (event.target.checked) {
                    form.setValue("days", [...current, day], { shouldValidate: true });
                  } else {
                    form.setValue(
                      "days",
                      current.filter((item) => item !== day),
                      { shouldValidate: true },
                    );
                  }
                }}
                className="h-4 w-4 rounded border-(--line)"
              />
              <span>{day}</span>
            </label>
          ))}
        </div>
        {form.formState.errors.days ? (
          <p className="mt-1 text-xs text-(--danger)">
            {form.formState.errors.days.message as string}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Start Time</label>
          <input
            type="time"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
            {...form.register("startTime", { required: "Start time is required." })}
          />
          {form.formState.errors.startTime ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.startTime.message}
            </p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">End Time</label>
          <input
            type="time"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm"
            {...form.register("endTime", { required: "End time is required." })}
          />
          {form.formState.errors.endTime ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.endTime.message}
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
