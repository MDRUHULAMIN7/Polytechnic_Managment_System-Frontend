"use client";

import { useEffect, useState } from "react";
import { updateAcademicSemesterAction } from "@/actions/dashboard/admin/academic-semester";
import { createAcademicSemester } from "@/lib/api/dashboard/admin/academic-semester";
import type {
  AcademicSemesterCode,
  AcademicSemesterInput,
  AcademicSemesterMonth,
  AcademicSemesterName,
} from "@/lib/type/dashboard/admin/academic-semester";
import type { AcademicSemesterFormModalProps } from "@/lib/type/dashboard/admin/academic-semester/ui";
import {
  ACADEMIC_SEMESTER_MONTHS,
  ACADEMIC_SEMESTER_NAME_CODE_MAP,
  ACADEMIC_SEMESTER_NAMES,
} from "@/lib/type/dashboard/admin/academic-semester/constants";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

const DEFAULT_NAME: AcademicSemesterName = "First";

export function AcademicSemesterFormModal({
  open,
  mode,
  semester,
  onClose,
  onSaved,
}: AcademicSemesterFormModalProps) {
  const [name, setName] = useState<AcademicSemesterName>(DEFAULT_NAME);
  const [code, setCode] = useState<AcademicSemesterCode>(
    ACADEMIC_SEMESTER_NAME_CODE_MAP[DEFAULT_NAME]
  );
  const [year, setYear] = useState("");
  const [startMonth, setStartMonth] = useState<AcademicSemesterMonth>("January");
  const [endMonth, setEndMonth] = useState<AcademicSemesterMonth>("December");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setCode(ACADEMIC_SEMESTER_NAME_CODE_MAP[name]);
  }, [name]);

  useEffect(() => {
    if (open) {
      const nextName = semester?.name ?? DEFAULT_NAME;
      setName(nextName);
      setCode(semester?.code ?? ACADEMIC_SEMESTER_NAME_CODE_MAP[nextName]);
      setYear(semester?.year ?? "");
      setStartMonth(semester?.startMonth ?? "January");
      setEndMonth(semester?.endMonth ?? "December");
    }
  }, [open, semester]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!year.trim()) {
      showToast({
        variant: "error",
        title: "Missing year",
        description: "Please enter semester year.",
      });
      return;
    }

    if (!/^\d{4}$/.test(year.trim())) {
      showToast({
        variant: "error",
        title: "Invalid year",
        description: "Year must be a 4 digit number.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload: AcademicSemesterInput = {
        name,
        code,
        year: year.trim(),
        startMonth,
        endMonth,
      };

      if (mode === "create") {
        await createAcademicSemester(payload);
        showToast({
          variant: "success",
          title: "Academic semester created",
          description: `${payload.name} semester created successfully.`,
        });
      } else if (semester?._id) {
        await updateAcademicSemesterAction(semester._id, payload);
        showToast({
          variant: "success",
          title: "Academic semester updated",
          description: `${payload.name} semester updated successfully.`,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Unable to save semester.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "create" ? "Create Academic Semester" : "Update Academic Semester"
      }
      description={
        mode === "create"
          ? "Add a new academic semester"
          : "Update semester information"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Semester Name
            </label>
            <select
              value={name}
              onChange={(event) =>
                setName(event.target.value as AcademicSemesterName)
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              {ACADEMIC_SEMESTER_NAMES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Semester Code
            </label>
            <input
              value={code}
              readOnly
              className="mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface-muted) px-3 text-sm text-(--text)"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Year
          </label>
          <input
            value={year}
            onChange={(event) => setYear(event.target.value)}
            placeholder="2026"
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
            maxLength={4}
            inputMode="numeric"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              Start Month
            </label>
            <select
              value={startMonth}
              onChange={(event) =>
                setStartMonth(event.target.value as AcademicSemesterMonth)
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              {ACADEMIC_SEMESTER_MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
              End Month
            </label>
            <select
              value={endMonth}
              onChange={(event) =>
                setEndMonth(event.target.value as AcademicSemesterMonth)
              }
              className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
            >
              {ACADEMIC_SEMESTER_MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
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
            {submitting ? "Saving..." : mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
