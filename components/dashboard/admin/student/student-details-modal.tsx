"use client";

import { useState } from "react";
import { Loader2, UserCircle2 } from "lucide-react";
import type { StudentProfile, UserStatus } from "@/lib/api/types";
import {
  resolveDepartmentName,
  resolveProfileImage,
  resolveSemesterLabel,
  resolveStudentFullName,
  resolveUserRole,
  resolveUserStatus,
} from "@/lib/utils/student/student-utils";
import { ModalFrame } from "@/components/ui/modal-frame";
import { formatDate } from "@/lib/utils/utils";

type StudentDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  detailLoading: boolean;
  detailRow: StudentProfile | null;
  statusOverride?: UserStatus;
};

export function StudentDetailsModal({
  open,
  onClose,
  detailLoading,
  detailRow,
  statusOverride,
}: StudentDetailsModalProps) {
  const status = resolveUserStatus(detailRow, statusOverride);

  return (
    <ModalFrame
      open={open}
      title="Student Details"
      description="Single student detail view."
      onClose={onClose}
    >
      {detailLoading ? (
        <div className="flex min-h-24 items-center justify-center text-sm text-(--text-dim)">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          Loading details...
        </div>
      ) : detailRow ? (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 rounded-xl border border-(--line) bg-(--surface-2) p-3">
            <ProfileAvatar src={resolveProfileImage(detailRow)} />
            <div>
              <p className="text-base font-semibold">
                {resolveStudentFullName(detailRow)}
              </p>
              <p className="text-xs text-(--text-dim)">{detailRow.id}</p>
              <p className="text-xs text-(--text-dim)">{detailRow.email}</p>
            </div>
          </div>
          <p>
            <span className="font-semibold">Gender:</span> {detailRow.gender}
          </p>
          <p>
            <span className="font-semibold">Blood Group:</span>{" "}
            {detailRow.bloodGroup ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Date of Birth:</span>{" "}
            {formatDate(detailRow.dateOfBirth)}
          </p>
          <p>
            <span className="font-semibold">Academic Department:</span>{" "}
            {resolveDepartmentName(detailRow.academicDepartment)}
          </p>
          <p>
            <span className="font-semibold">Admission Semester:</span>{" "}
            {resolveSemesterLabel(detailRow.admissionSemester)}
          </p>
          <p>
            <span className="font-semibold">Contact No:</span>{" "}
            {detailRow.contactNo}
          </p>
          <p>
            <span className="font-semibold">Emergency Contact:</span>{" "}
            {detailRow.emergencyContactNo}
          </p>
          <p>
            <span className="font-semibold">Present Address:</span>{" "}
            {detailRow.presentAddress}
          </p>
          <p>
            <span className="font-semibold">Permanent Address:</span>{" "}
            {detailRow.permanentAddress}
          </p>
          <p>
            <span className="font-semibold">Guardian:</span>{" "}
            {detailRow.guardian?.fatherName ?? "-"} /{" "}
            {detailRow.guardian?.motherName ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Local Guardian:</span>{" "}
            {detailRow.localGuardian?.name ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Account Status:</span>{" "}
            {status ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Role:</span>{" "}
            {resolveUserRole(detailRow)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-(--text-dim)">No details available.</p>
      )}
    </ModalFrame>
  );
}

function ProfileAvatar({ src }: { src: string | null }) {
  const [isInvalid, setIsInvalid] = useState(false);

  if (!src || isInvalid) {
    return (
      <div className="grid h-18 w-18 place-items-center rounded-xl border border-dashed border-(--line) bg-(--surface)">
        <UserCircle2 className="h-9 w-9 text-(--text-dim)" aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden
      width={72}
      height={72}
      className="h-18 w-18 rounded-xl object-cover"
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setIsInvalid(true)}
    />
  );
}
