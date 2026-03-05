"use client";

import { useEffect, useState } from "react";
import type {
  SemesterRegistrationInput,
  SemesterRegistrationShift,
  SemesterRegistrationStatus,
} from "@/lib/type/dashboard/admin/semester-registration";
import type {
  SemesterRegistrationFormModalProps,
  SemesterRegistrationFormState,
} from "@/lib/type/dashboard/admin/semester-registration/ui";
import {
  SEMESTER_REGISTRATION_SHIFTS,
  SEMESTER_REGISTRATION_STATUSES,
} from "@/lib/type/dashboard/admin/semester-registration/constants";
import { updateSemesterRegistrationAction } from "@/actions/dashboard/admin/semester-registration";
import { createSemesterRegistration } from "@/lib/api/dashboard/admin/semester-registration";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

const initialState: SemesterRegistrationFormState = {
  academicSemester: "",
  status: "",
  shift: "",
  startDate: "",
  endDate: "",
  totalCredit: "",
};

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (num: number) => String(num).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toIso(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toISOString();
}

function renderSemesterOption(value: { _id: string; name?: string; year?: string }) {
  const label = [value.name, value.year].filter(Boolean).join(" ");
  return label || value._id;
}

export function SemesterRegistrationFormModal({
  open,
  registration,
  semesters,
  onClose,
  onSaved,
}: SemesterRegistrationFormModalProps) {
  const [form, setForm] = useState<SemesterRegistrationFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(registration?._id);

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      academicSemester:
        typeof registration?.academicSemester === "string"
          ? registration.academicSemester
          : registration?.academicSemester?._id ?? "",
      status: registration?.status ?? "",
      shift: registration?.shift ?? "",
      startDate: toLocalInput(registration?.startDate),
      endDate: toLocalInput(registration?.endDate),
      totalCredit:
        registration?.totalCredit !== undefined
          ? String(registration.totalCredit)
          : "",
    });
  }, [open, registration]);

  function updateField<T extends keyof SemesterRegistrationFormState>(
    key: T,
    value: SemesterRegistrationFormState[T]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !form.academicSemester ||
      !form.status ||
      !form.shift ||
      !form.startDate ||
      !form.endDate ||
      !form.totalCredit
    ) {
      showToast({
        variant: "error",
        title: "Missing fields",
        description: "Please complete all required fields.",
      });
      return;
    }

    const totalCredit = Number(form.totalCredit);
    if (!Number.isFinite(totalCredit) || totalCredit <= 0) {
      showToast({
        variant: "error",
        title: "Invalid credit",
        description: "Total credit must be a positive number.",
      });
      return;
    }

    const payload: SemesterRegistrationInput = {
      academicSemester: form.academicSemester,
      status: form.status as SemesterRegistrationStatus,
      shift: form.shift as SemesterRegistrationShift,
      startDate: toIso(form.startDate),
      endDate: toIso(form.endDate),
      totalCredit,
    };

    setSubmitting(true);
    try {
      if (isEdit && registration?._id) {
        await updateSemesterRegistrationAction(registration._id, payload);
      } else {
        await createSemesterRegistration(payload);
      }
      showToast({
        variant: "success",
        title: isEdit ? "Registration updated" : "Registration created",
        description: isEdit
          ? "Semester registration updated successfully."
          : "Semester registration created successfully.",
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
              ? "Unable to update semester registration."
              : "Unable to create semester registration.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Update Semester Registration" : "Create Semester Registration"}
      description={
        isEdit ? "Update semester registration details" : "Add a new semester registration"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Academic Semester
            </label>
            <select
              value={form.academicSemester}
              onChange={(event) => updateField("academicSemester", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select semester
              </option>
              {semesters.map((semester) => (
                <option
                  key={semester._id}
                  value={semester._id}
                  className="bg-(--surface) text-(--text)"
                >
                  {renderSemesterOption(semester)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Status
            </label>
            <select
              value={form.status}
              onChange={(event) =>
                updateField("status", event.target.value as SemesterRegistrationStatus | "")
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select status
              </option>
              {SEMESTER_REGISTRATION_STATUSES.map((item) => (
                <option key={item} value={item} className="bg-(--surface) text-(--text)">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Shift
            </label>
            <select
              value={form.shift}
              onChange={(event) =>
                updateField("shift", event.target.value as SemesterRegistrationShift | "")
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              <option value="" className="bg-(--surface) text-(--text)">
                Select shift
              </option>
              {SEMESTER_REGISTRATION_SHIFTS.map((item) => (
                <option key={item} value={item} className="bg-(--surface) text-(--text)">
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={form.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              End Date
            </label>
            <input
              type="datetime-local"
              value={form.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Total Credit
            </label>
            <input
              value={form.totalCredit}
              onChange={(event) => updateField("totalCredit", event.target.value)}
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
              inputMode="numeric"
            />
          </div>
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
