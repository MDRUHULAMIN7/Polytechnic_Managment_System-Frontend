"use client";

import type { InstructorAssignOption } from "@/lib/utils/subject/subject-utils";
import { resolveInstructorFullName } from "@/lib/utils/subject/subject-utils";
import { ModalFrame } from "@/components/ui/modal-frame";

type SubjectAssignModalProps = {
  open: boolean;
  onClose: () => void;
  subjectTitle: string;
  instructors: InstructorAssignOption[];
  assignedInstructorIds: string[];
  selectedInstructorIds: string[];
  loading: boolean;
  submitting: boolean;
  onToggle: (instructorId: string) => void;
  onAssign: () => void;
  onRemove: () => void;
};

export function SubjectAssignModal({
  open,
  onClose,
  subjectTitle,
  instructors,
  assignedInstructorIds,
  selectedInstructorIds,
  loading,
  submitting,
  onToggle,
  onAssign,
  onRemove,
}: SubjectAssignModalProps) {
  return (
    <ModalFrame
      open={open}
      title="Assign Instructors"
      description={`Select instructors for subject: ${subjectTitle}`}
      onClose={onClose}
      maxWidthClassName="max-w-180"
    >
      {loading ? (
        <div className="min-h-24 rounded-xl border border-dashed border-(--line) p-4 text-sm text-(--text-dim)">
          Loading instructors...
        </div>
      ) : instructors.length === 0 ? (
        <div className="min-h-24 rounded-xl border border-dashed border-(--line) p-4 text-sm text-(--text-dim)">
          No instructors available.
        </div>
      ) : (
        <>
          <div className="mb-3 rounded-xl border border-(--line) bg-(--surface-2) p-3 text-xs text-(--text-dim)">
            Assigned right now: {assignedInstructorIds.length}
          </div>

          <div className="max-h-80 overflow-y-auto rounded-xl border border-(--line)">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-(--line) text-xs uppercase tracking-[0.08em] text-(--text-dim)">
                  <th className="px-3 py-2">Select</th>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Designation</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((instructor) => {
                  const checked = selectedInstructorIds.includes(
                    instructor._id,
                  );
                  const isAssigned = assignedInstructorIds.includes(
                    instructor._id,
                  );
                  return (
                    <tr
                      key={instructor._id}
                      className="border-b border-(--line) last:border-b-0"
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(instructor._id)}
                          className="h-4 w-4 rounded border-(--line)"
                        />
                      </td>
                      <td className="px-3 py-2">{instructor.id ?? "-"}</td>
                      <td className="px-3 py-2">
                        {resolveInstructorFullName(instructor)}
                      </td>
                      <td className="px-3 py-2 text-(--text-dim)">
                        {instructor.designation ?? "-"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                            isAssigned
                              ? "border-emerald-600/35 bg-emerald-500/10 text-emerald-500"
                              : "border-(--line) bg-(--surface) text-(--text-dim)"
                          }`}
                        >
                          {isAssigned ? "Assigned" : "Not Assigned"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring rounded-lg border border-(--line) px-3 py-2 text-sm"
              disabled={submitting}
            >
              Close
            </button>
            <button
              type="button"
              onClick={onAssign}
              disabled={submitting || selectedInstructorIds.length === 0}
              className="focus-ring rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-500 disabled:opacity-55"
            >
              {submitting ? "Working..." : "Assign Selected"}
            </button>
            <button
              type="button"
              onClick={onRemove}
              disabled={submitting || selectedInstructorIds.length === 0}
              className="focus-ring rounded-lg border border-amber-600/30 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-500 disabled:opacity-55"
            >
              {submitting ? "Working..." : "Remove Selected"}
            </button>
          </div>
        </>
      )}
    </ModalFrame>
  );
}
