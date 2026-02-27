"use client";

import { useEffect, useState } from "react";
import {
  createAcademicInstructorAction,
  updateAcademicInstructorAction,
} from "@/actions/dashboard/admin/academic-instructor";
import type {
  AcademicInstructorInput,
} from "@/lib/type/dashboard/admin/academic-instructor";
import type { AcademicInstructorFormModalProps } from "@/lib/type/dashboard/admin/academic-instructor/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";

export function AcademicInstructorFormModal({
  open,
  mode,
  instructor,
  onClose,
  onSaved,
}: AcademicInstructorFormModalProps) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(instructor?.name ?? "");
    }
  }, [open, instructor]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) {
      showToast({
        variant: "error",
        title: "Missing name",
        description: "Please enter instructor name.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload: AcademicInstructorInput = { name: name.trim() };
      if (mode === "create") {
        await createAcademicInstructorAction(payload);
        showToast({
          variant: "success",
          title: "Academic instructor created",
          description: `${payload.name} added successfully.`,
        });
      } else if (instructor?._id) {
        await updateAcademicInstructorAction(instructor._id, payload);
        showToast({
          variant: "success",
          title: "Academic instructor updated",
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
          error instanceof Error ? error.message : "Unable to save instructor.",
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
        mode === "create" ? "Create Academic Instructor" : "Update Academic Instructor"
      }
      description={
        mode === "create"
          ? "Add a new academic instructor"
          : "Update instructor information"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-(--text-dim)">
            Name
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter name"
            className="focus-ring mt-2 h-11 w-full rounded-xl border border-(--line) bg-transparent px-3 text-sm"
          />
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
