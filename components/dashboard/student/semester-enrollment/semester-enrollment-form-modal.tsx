"use client";

import { useEffect, useMemo, useState } from "react";
import type { Curriculum } from "@/lib/type/dashboard/admin/curriculum";
import type {
  SemesterEnrollmentFormModalProps,
  SemesterEnrollmentFormState,
} from "@/lib/type/dashboard/admin/semester-enrollment/ui";
import { createSemesterEnrollment } from "@/lib/api/dashboard/admin/semester-enrollment";
import { showToast } from "@/utils/common/toast";
import { Modal } from "@/components/dashboard/admin/semester-enrollment/modal";

const initialState: SemesterEnrollmentFormState = {
  curriculum: "",
};

function renderSemester(value?: Curriculum["academicSemester"]) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  return `${value.name ?? ""} ${value.year ?? ""}`.trim() || "--";
}

function formatShortDate(value?: string) {
  if (!value) {
    return "--";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleDateString();
}

function renderRegistration(value?: Curriculum["semisterRegistration"]) {
  if (!value) return "--";
  if (typeof value === "string") return value;
  const dateRange = `${formatShortDate(value.startDate)} -> ${formatShortDate(
    value.endDate
  )}`;
  const totalCredit =
    typeof value.totalCredit === "number" ? `${value.totalCredit} credits` : "--";
  return `${value.status ?? "--"} | ${value.shift ?? "--"} | ${dateRange} | ${totalCredit}`;
}

export function SemesterEnrollmentFormModal({
  open,
  curriculums,
  onClose,
  onSaved,
}: SemesterEnrollmentFormModalProps) {
  const [form, setForm] = useState<SemesterEnrollmentFormState>(initialState);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    setForm(initialState);
  }, [open]);

  function updateField(value: string) {
    setForm({ curriculum: value });
  }

  const selectedCurriculum = useMemo(
    () => curriculums.find((item) => item._id === form.curriculum),
    [curriculums, form.curriculum]
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.curriculum) {
      showToast({
        variant: "error",
        title: "Select curriculum",
        description: "Please select a curriculum to enroll.",
      });
      return;
    }

    setSubmitting(true);
    try {
      await createSemesterEnrollment({ curriculum: form.curriculum });
      showToast({
        variant: "success",
        title: "Enrollment submitted",
        description: "Semester enrollment created successfully.",
      });
      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Enrollment failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to create semester enrollment.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Semester Enrollment"
      description="Choose a curriculum for your department."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Curriculum
          </label>
          <select
            value={form.curriculum}
            onChange={(event) => updateField(event.target.value)}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="" className="bg-(--surface) text-(--text)">
              Select curriculum
            </option>
            {curriculums.map((item) => (
              <option
                key={item._id}
                value={item._id}
                className="bg-(--surface) text-(--text)"
              >
                {item.session} | Reg {item.regulation} |{" "}
                {renderSemester(item.academicSemester)} |{" "}
                {renderRegistration(item.semisterRegistration)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Academic Semester
            </p>
            <p className="mt-2 text-sm font-medium">
              {renderSemester(selectedCurriculum?.academicSemester)}
            </p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Semester Registration
            </p>
            <p className="mt-2 text-sm font-medium">
              {renderRegistration(selectedCurriculum?.semisterRegistration)}
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Session / Regulation
            </p>
            <p className="mt-2 text-sm font-medium">
              {selectedCurriculum?.session ?? "--"} | Reg{" "}
              {selectedCurriculum?.regulation ?? "--"}
            </p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Registration Status
            </p>
            <p className="mt-2 text-sm font-medium">
              {typeof selectedCurriculum?.semisterRegistration === "string"
                ? selectedCurriculum.semisterRegistration
                : selectedCurriculum?.semisterRegistration?.status ?? "--"}{" "}
              /{" "}
              {typeof selectedCurriculum?.semisterRegistration === "string"
                ? "--"
                : selectedCurriculum?.semisterRegistration?.shift ?? "--"}
            </p>
          </div>
          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Registration Dates
            </p>
            <p className="mt-2 text-sm font-medium">
              {typeof selectedCurriculum?.semisterRegistration === "string"
                ? "--"
                : `${formatShortDate(
                    selectedCurriculum?.semisterRegistration?.startDate
                  )} -> ${formatShortDate(
                    selectedCurriculum?.semisterRegistration?.endDate
                  )}`}
            </p>
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
            {submitting ? "Saving..." : "Enroll"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
