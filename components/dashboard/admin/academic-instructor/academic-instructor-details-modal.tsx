"use client";

import { useEffect, useState } from "react";
import { getAcademicInstructor } from "@/lib/api/dashboard/admin/academic-instructor";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { AcademicInstructorDetailsModalProps } from "@/lib/type/dashboard/admin/academic-instructor/ui";
import { showToast } from "@/utils/common/toast";
import { Modal } from "./modal";
import { formatDate } from "@/utils/common/utils";

export function AcademicInstructorDetailsModal({
  open,
  instructorId,
  onClose,
}: AcademicInstructorDetailsModalProps) {
  const [details, setDetails] = useState<AcademicInstructor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !instructorId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDetails(null);
      return;
    }

    let active = true;
    setLoading(true);

    getAcademicInstructor(instructorId)
      .then((data) => {
        if (!active) return;
        setDetails(data);
      })
      .catch((error) => {
        if (!active) return;
        showToast({
          variant: "error",
          title: "Failed to load",
          description:
            error instanceof Error
              ? error.message
              : "Unable to load instructor details.",
        });
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, instructorId]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Academic Instructor Details"
      description="View instructor information"
    >
      {loading ? (
        <div className="flex h-32 items-center justify-center text-sm text-(--text-dim)">
          Loading details...
        </div>
      ) : details ? (
        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-(--line) bg-(--surface-muted) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              Name
            </p>
            <p className="mt-2 text-base font-semibold">{details.name}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-(--line) px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                Created
              </p>
              <p className="mt-2 font-medium">
                {formatDate(details.createdAt)}
              </p>
            </div>
            <div className="rounded-xl border border-(--line) px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
                Updated
              </p>
              <p className="mt-2 font-medium">
                {formatDate(details.updatedAt)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-(--line) px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-(--text-dim)">
              ID
            </p>
            <p className="mt-2 break-all font-mono text-xs">{details._id}</p>
          </div>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center text-sm text-(--text-dim)">
          No details available.
        </div>
      )}
    </Modal>
  );
}
