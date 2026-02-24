"use client";

import { Loader2 } from "lucide-react";
import type { SubjectProfile } from "@/lib/api/types";
import {
  resolvePreRequisiteLabel,
  resolveSubjectCode,
} from "@/lib/utils/subject/subject-utils";
import { ModalFrame } from "@/components/ui/modal-frame";

type SubjectDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  detailLoading: boolean;
  detailRow: SubjectProfile | null;
  assignedInstructors: string[];
};

export function SubjectDetailsModal({
  open,
  onClose,
  detailLoading,
  detailRow,
  assignedInstructors,
}: SubjectDetailsModalProps) {
  return (
    <ModalFrame
      open={open}
      title="Subject Details"
      description="Single subject detail view."
      onClose={onClose}
    >
      {detailLoading ? (
        <div className="flex min-h-24 items-center justify-center text-sm text-(--text-dim)">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Loading details...
        </div>
      ) : detailRow ? (
        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold">Title:</span> {detailRow.title}
          </p>
          <p>
            <span className="font-semibold">Code:</span>{" "}
            {resolveSubjectCode(detailRow)}
          </p>
          <p>
            <span className="font-semibold">Credits:</span> {detailRow.credits}
          </p>
          <p>
            <span className="font-semibold">Regulation:</span>{" "}
            {detailRow.regulation}
          </p>
          <div>
            <p className="font-semibold">Assigned Instructors:</p>
            {assignedInstructors.length > 0 ? (
              <ul className="mt-1 space-y-1 text-(--text-dim)">
                {assignedInstructors.map((name, index) => (
                  <li key={`${name}-${index}`}>{name}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-(--text-dim)">No instructors assigned.</p>
            )}
          </div>
          <div>
            <p className="font-semibold">Pre-Requisite Subjects:</p>
            {detailRow.preRequisiteSubjects &&
            detailRow.preRequisiteSubjects.length > 0 ? (
              <ul className="mt-1 space-y-1 text-(--text-dim)">
                {detailRow.preRequisiteSubjects
                  .filter((item) => !item.isDeleted)
                  .map((item, index) => (
                    <li
                      key={`${typeof item.subject === "string" ? item.subject : item.subject._id}-${index}`}
                    >
                      {resolvePreRequisiteLabel(item)}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="mt-1 text-(--text-dim)">No pre-requisites.</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-(--text-dim)">No details available.</p>
      )}
    </ModalFrame>
  );
}
