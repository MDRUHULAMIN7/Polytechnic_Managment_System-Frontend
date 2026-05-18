"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SubjectAssignModalProps } from "@/lib/type/dashboard/admin/subject/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";
import {
  assignInstructorsAction,
  getInstructorsAction,
  getSubjectInstructorsAction,
  removeInstructorsAction,
} from "@/actions/dashboard/admin/subject";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

function resolveName(name?: { firstName?: string; middleName?: string; lastName?: string }) {
  if (!name) return "--";
  return [name.firstName, name.middleName, name.lastName].filter(Boolean).join(" ");
}

export function SubjectAssignModal({ open, subject, onClose }: SubjectAssignModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [assignedInstructors, setAssignedInstructors] = useState<Instructor[]>([]);

  const fetchInstructors = useCallback(async () => {
    if (!subject?._id) return;

    setLoading(true);
    try {
      const [instructorsPayload, assignedPayload] = await Promise.all([
        getInstructorsAction({ page: 1, limit: 100 }),
        getSubjectInstructorsAction(subject._id),
      ]);
      setAllInstructors(instructorsPayload.result ?? []);
      setAssignedInstructors(assignedPayload.instructors ?? []);
    } catch (err) {
      showToast({
        variant: "error",
        title: "Load failed",
        description: err instanceof Error ? err.message : "Unable to load instructors.",
      });
    } finally {
      setLoading(false);
    }
  }, [subject?._id]);

  useEffect(() => {
    if (open) {
      setSelected([]);
      fetchInstructors();
    }
  }, [open, fetchInstructors]);

  const assignedIds = useMemo(
    () => new Set(assignedInstructors.map((item) => item._id)),
    [assignedInstructors]
  );

  const availableInstructors = useMemo(
    () => allInstructors.filter((item) => !assignedIds.has(item._id)),
    [allInstructors, assignedIds]
  );

  async function handleAssign() {
    if (!subject?._id) return;
    if (selected.length === 0) {
      showToast({ variant: "error", title: "Select instructors", description: "Please select at least one instructor." });
      return;
    }

    setSubmitting(true);
    try {
      await assignInstructorsAction(subject._id, selected);
      showToast({ variant: "success", title: "Assigned", description: "Instructors assigned successfully." });
      setSelected([]);
      await fetchInstructors();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Assign failed",
        description: error instanceof Error ? error.message : "Unable to assign instructors.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(instructorId: string) {
    if (!subject?._id) return;

    setRemovingId(instructorId);
    try {
      await removeInstructorsAction(subject._id, [instructorId]);
      showToast({ variant: "success", title: "Removed", description: "Instructor removed successfully." });
      await fetchInstructors();
    } catch (error) {
      showToast({
        variant: "error",
        title: "Remove failed",
        description: error instanceof Error ? error.message : "Unable to remove instructor.",
      });
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign Instructors${subject?.title ? ` - ${subject.title}` : ""}`}
      description="Select instructors to assign or remove existing ones."
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Assign New
          </p>
          {loading ? (
            <div className="text-sm text-(--text-dim)">Loading instructors...</div>
          ) : (
            <div className="space-y-3">
              <div className="max-h-52 space-y-3 overflow-y-auto rounded-xl border border-(--line) bg-(--surface) p-3 text-sm text-(--text)">
                {availableInstructors.length === 0 ? (
                  <div className="text-sm text-(--text-dim)">No instructors available</div>
                ) : (
                  availableInstructors.map((instructor) => {
                    const id = instructor._id;
                    const checked = selected.includes(id);
                    return (
                      <label
                        key={id}
                        className={`flex cursor-pointer items-center gap-4 rounded-lg border border-(--line) px-3 py-3 transition hover:border-(--accent)/50 ${
                          checked ? "bg-(--surface-muted)" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => {
                            if (event.target.checked) {
                              setSelected((prev) => Array.from(new Set([...prev, id])));
                            } else {
                              setSelected((prev) => prev.filter((item) => item !== id));
                            }
                          }}
                          className="h-4 w-4 accent-(--accent)"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{resolveName(instructor.name)}</p>
                          <p className="text-xs text-(--text-dim)">{instructor.designation}</p>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
              <button
                type="button"
                disabled={submitting || selected.length === 0}
                onClick={handleAssign}
                className="focus-ring inline-flex h-10 items-center justify-center rounded-xl bg-(--accent) px-4 text-sm font-semibold text-(--accent-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Assigning..." : "Assign Selected"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-dim)">
            Assigned Instructors
          </p>
          {assignedInstructors.length === 0 ? (
            <p className="text-sm text-(--text-dim)">No instructors assigned.</p>
          ) : (
            <div className="space-y-2">
              {assignedInstructors.map((instructor) => (
                <div
                  key={instructor._id}
                  className="flex items-center justify-between rounded-xl border border-(--line) px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{resolveName(instructor.name)}</p>
                    <p className="text-xs text-(--text-dim)">{instructor.designation}</p>
                  </div>
                  <button
                    type="button"
                    disabled={removingId === instructor._id}
                    onClick={() => handleRemove(instructor._id)}
                    className="focus-ring inline-flex h-9 items-center justify-center rounded-lg border border-red-500/50 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {removingId === instructor._id ? "Removing..." : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

