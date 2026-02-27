"use client";

import { useEffect, useState } from "react";
import {
  createAcademicDepartmentAction,
  updateAcademicDepartmentAction,
} from "@/actions/dashboard/admin/academic-department";
import type { AcademicDepartmentInput } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicDepartmentFormModalProps } from "@/lib/type/dashboard/admin/academic-department/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

export function AcademicDepartmentFormModal({
  open,
  mode,
  department,
  instructors,
  onClose,
  onSaved,
}: AcademicDepartmentFormModalProps) {
  const [name, setName] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(department?.name ?? "");
      const nextInstructor =
        typeof department?.academicInstructor === "string"
          ? department.academicInstructor
          : department?.academicInstructor?._id ?? "";
      setInstructorId(nextInstructor);
    }
  }, [open, department]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      showToast({
        variant: "error",
        title: "Missing name",
        description: "Please enter department name.",
      });
      return;
    }

    if (!instructorId) {
      showToast({
        variant: "error",
        title: "Missing instructor",
        description: "Please select academic instructor.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload: AcademicDepartmentInput = {
        name: name.trim(),
        academicInstructor: instructorId,
      };

      if (mode === "create") {
        await createAcademicDepartmentAction(payload);
        showToast({
          variant: "success",
          title: "Academic department created",
          description: `${payload.name} added successfully.`,
        });
      } else if (department?._id) {
        await updateAcademicDepartmentAction(department._id, payload);
        showToast({
          variant: "success",
          title: "Academic department updated",
          description: `${payload.name} updated successfully.`,
        });
      }

      onSaved();
      onClose();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Action failed",
        description:
          error instanceof Error ? error.message : "Unable to save department.",
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
        mode === "create" ? "Create Academic Department" : "Update Academic Department"
      }
      description={
        mode === "create"
          ? "Add a new academic department"
          : "Update department information"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Department Name
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter department name"
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Academic Instructor
          </label>
          <select
            value={instructorId}
            onChange={(event) => setInstructorId(event.target.value)}
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-(--surface) px-3 text-sm text-(--text)"
          >
            <option value="">Select instructor</option>
            {instructors.map((instructor) => (
              <option key={instructor._id} value={instructor._id}>
                {instructor.name}
              </option>
            ))}
          </select>
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
