"use client";

import { useEffect, useMemo, useState } from "react";
import type { CurriculumInput, CurriculumUpdateInput } from "@/lib/type/dashboard/admin/curriculum";
import type { CurriculumFormModalProps, CurriculumFormState } from "@/lib/type/dashboard/admin/curriculum/ui";
import { createCurriculumAction, updateCurriculumAction } from "@/actions/dashboard/admin/curriculum";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

const initialState: CurriculumFormState = {
  academicDepartment: "",
  semisterRegistration: "",
  regulation: "",
  session: "",
  subjects: [],
};

function renderSemesterLabel(value: unknown) {
  if (!value) {
    return "--";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && "name" in value && "year" in value) {
    const name = (value as { name?: string }).name ?? "";
    const year = (value as { year?: string }).year ?? "";
    return `${name} ${year}`.trim() || "--";
  }
  return "--";
}

function subjectLabel(subject: { title: string; prefix?: string; code?: number }) {
  const code = subject.code ? `${subject.prefix ?? ""}${subject.code}` : subject.prefix;
  return code ? `${subject.title} (${code})` : subject.title;
}

export function CurriculumFormModal({
  open,
  curriculum,
  academicDepartments,
  semesterRegistrations,
  subjects,
  onClose,
  onSaved,
}: CurriculumFormModalProps) {
  const [form, setForm] = useState<CurriculumFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [existingSubjectIds, setExistingSubjectIds] = useState<string[]>([]);
  const isEdit = Boolean(curriculum?._id);

  useEffect(() => {
    if (!open) {
      return;
    }

    const existingIds =
      curriculum?.subjects?.map((item) =>
        typeof item === "string" ? item : item._id
      ) ?? [];

    setForm({
      academicDepartment:
        typeof curriculum?.academicDepartment === "string"
          ? curriculum.academicDepartment
          : curriculum?.academicDepartment?._id ?? "",
      semisterRegistration:
        typeof curriculum?.semisterRegistration === "string"
          ? curriculum.semisterRegistration
          : curriculum?.semisterRegistration?._id ?? "",
      regulation:
        curriculum?.regulation !== undefined ? String(curriculum.regulation) : "",
      session: curriculum?.session ?? "",
      subjects: [],
    });
    setExistingSubjectIds(existingIds);
  }, [open, curriculum]);

  function updateField<T extends keyof CurriculumFormState>(
    key: T,
    value: CurriculumFormState[T]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedRegistration = useMemo(
    () =>
      semesterRegistrations.find(
        (item) => item._id === form.semisterRegistration
      ),
    [semesterRegistrations, form.semisterRegistration]
  );

  const semesterLabel = useMemo(
    () => renderSemesterLabel(selectedRegistration?.academicSemester),
    [selectedRegistration]
  );

  const regulationNumber = Number(form.regulation);
  const regulationFilter = Number.isFinite(regulationNumber)
    ? regulationNumber
    : null;

  const availableSubjects = useMemo(() => {
    const filtered = regulationFilter
      ? subjects.filter((item) => item.regulation === regulationFilter)
      : subjects;
    return filtered.filter((item) => !existingSubjectIds.includes(item._id));
  }, [subjects, existingSubjectIds, regulationFilter]);

  function toggleSubject(id: string, checked: boolean) {
    updateField(
      "subjects",
      checked
        ? Array.from(new Set([...form.subjects, id]))
        : form.subjects.filter((item) => item !== id)
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.academicDepartment || !form.semisterRegistration || !form.session) {
      showToast({
        variant: "error",
        title: "Missing fields",
        description: "Please complete all required fields.",
      });
      return;
    }

    const sessionValue = form.session.trim();
    if (!/^\d{4}-\d{4}$/.test(sessionValue)) {
      showToast({
        variant: "error",
        title: "Invalid session",
        description: "Session must be in format YYYY-YYYY.",
      });
      return;
    }

    const regulation = Number(form.regulation);
    if (!Number.isFinite(regulation) || regulation <= 0) {
      showToast({
        variant: "error",
        title: "Invalid regulation",
        description: "Regulation must be a positive number.",
      });
      return;
    }

    if (!isEdit && form.subjects.length === 0) {
      showToast({
        variant: "error",
        title: "Select subjects",
        description: "Please select at least one subject.",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && curriculum?._id) {
        const payload: CurriculumUpdateInput = {};

        if (form.academicDepartment) {
          payload.academicDepartment = form.academicDepartment;
        }
        if (form.semisterRegistration) {
          payload.semisterRegistration = form.semisterRegistration;
        }
        if (sessionValue) {
          payload.session = sessionValue;
        }
        if (Number.isFinite(regulation)) {
          payload.regulation = regulation;
        }
        if (form.subjects.length > 0) {
          payload.subjects = form.subjects;
        }

        await updateCurriculumAction(curriculum._id, payload);
      } else {
        const payload: CurriculumInput = {
          academicDepartment: form.academicDepartment,
          semisterRegistration: form.semisterRegistration,
          regulation,
          session: sessionValue,
          subjects: form.subjects,
        };
        await createCurriculumAction(payload);
      }

      showToast({
        variant: "success",
        title: isEdit ? "Curriculum updated" : "Curriculum created",
        description: isEdit
          ? "Curriculum updated successfully."
          : "Curriculum created successfully.",
      });
      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: isEdit ? "Update failed" : "Create failed",
        description:
          error instanceof Error
            ? error.message
            : isEdit
              ? "Unable to update curriculum."
              : "Unable to create curriculum.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Update Curriculum" : "Create Curriculum"}
      description={
        isEdit ? "Add subjects or update curriculum details." : "Create a new curriculum."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Academic Department
            </label>
            <select
              value={form.academicDepartment}
              onChange={(event) => updateField("academicDepartment", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            >
              <option value="">Select department</option>
              {academicDepartments.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Semester Registration
            </label>
            <select
              value={form.semisterRegistration}
              onChange={(event) =>
                updateField("semisterRegistration", event.target.value)
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            >
              <option value="">Select registration</option>
              {semesterRegistrations.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.status} - {item.shift}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-(--text-dim)">
              Academic Semester: <span className="font-medium">{semesterLabel}</span>
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Session
            </label>
            <input
              value={form.session}
              onChange={(event) => updateField("session", event.target.value)}
              placeholder="2024-2025"
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
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
              inputMode="numeric"
            />
          </div>
        </div>

        {isEdit ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Existing Subjects
            </p>
            {existingSubjectIds.length === 0 ? (
              <p className="text-sm text-(--text-dim)">No subjects assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {existingSubjectIds.map((id) => {
                  const subject = subjects.find((item) => item._id === id);
                  return (
                    <span
                      key={id}
                      className="rounded-full border border-(--line) px-3 py-1 text-xs text-(--text-dim)"
                    >
                      {subject ? subjectLabel(subject) : id}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ) : null}

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            {isEdit ? "Add Subjects" : "Subjects"}
          </p>
          <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-(--line) bg-(--surface) p-3 text-sm">
            {availableSubjects.length === 0 ? (
              <p className="text-(--text-dim)">No subjects available.</p>
            ) : (
              availableSubjects.map((item) => {
                const checked = form.subjects.includes(item._id);
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
                      onChange={(event) => toggleSubject(item._id, event.target.checked)}
                      className="h-4 w-4 accent-(--accent)"
                    />
                    <span className="font-medium">{subjectLabel(item)}</span>
                  </label>
                );
              })
            )}
          </div>
          {regulationFilter ? (
            <p className="text-xs text-(--text-dim)">
              Showing subjects for regulation {regulationFilter}.
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold text-(--text-dim) transition hover:bg-(--surface-muted)"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
