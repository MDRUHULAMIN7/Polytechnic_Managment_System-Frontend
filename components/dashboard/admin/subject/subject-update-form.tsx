"use client";

import type { UseFormReturn } from "react-hook-form";
import type {
  SubjectOption,
  UpdateSubjectFormValues,
} from "@/lib/utils/subject/subject-utils";

type SubjectUpdateFormProps = {
  form: UseFormReturn<UpdateSubjectFormValues>;
  onSubmit: ReturnType<UseFormReturn<UpdateSubjectFormValues>["handleSubmit"]>;
  onCancel: () => void;
  availableSubjects: SubjectOption[];
};

export function SubjectUpdateForm({
  form,
  onSubmit,
  onCancel,
  availableSubjects,
}: SubjectUpdateFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="update-subject-title"
          className="mb-1 block text-sm font-medium"
        >
          Title
        </label>
        <input
          id="update-subject-title"
          type="text"
          className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
          {...form.register("title", { required: "Title is required." })}
        />
        {form.formState.errors.title ? (
          <p className="mt-1 text-xs text-(--danger)">
            {form.formState.errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="update-subject-prefix"
            className="mb-1 block text-sm font-medium"
          >
            Prefix
          </label>
          <input
            id="update-subject-prefix"
            type="text"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("prefix", { required: "Prefix is required." })}
          />
          {form.formState.errors.prefix ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.prefix.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="update-subject-code"
            className="mb-1 block text-sm font-medium"
          >
            Code
          </label>
          <input
            id="update-subject-code"
            type="number"
            min={0}
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("code", { required: "Code is required." })}
          />
          {form.formState.errors.code ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.code.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="update-subject-credits"
            className="mb-1 block text-sm font-medium"
          >
            Credits
          </label>
          <input
            id="update-subject-credits"
            type="number"
            min={0}
            step="0.5"
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
            {...form.register("credits", { required: "Credits is required." })}
          />
          {form.formState.errors.credits ? (
            <p className="mt-1 text-xs text-(--danger)">
              {form.formState.errors.credits.message}
            </p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="update-subject-regulation"
            className="mb-1 block text-sm font-medium"
          >
            Regulation
          </label>
          <input
            id="update-subject-regulation"
            type="number"
            min={0}
            className="focus-ring w-full rounded-xl border border-(--line) px-3 py-2 text-sm outline-none"
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
        <p className="mb-1 block text-sm font-medium">Pre-Requisite Subjects</p>
        {availableSubjects.length === 0 ? (
          <p className="rounded-xl border border-dashed border-(--line) px-3 py-2 text-xs text-(--text-dim)">
            No subject available to assign as pre-requisite.
          </p>
        ) : (
          <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl border border-(--line) p-2">
            {availableSubjects.map((subject) => (
              <label
                key={subject._id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-(--surface-2)"
              >
                <input
                  type="checkbox"
                  value={subject._id}
                  className="h-4 w-4 rounded border-(--line)"
                  {...form.register("preRequisiteSubjectIds")}
                />
                <span>{`${subject.prefix}${subject.code} - ${subject.title}`}</span>
              </label>
            ))}
          </div>
        )}
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
          {form.formState.isSubmitting ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  );
}
