"use client";

import { useState } from "react";
import { Loader2, UserCircle2 } from "lucide-react";
import type { AdminProfile } from "@/lib/api/types";
import {
  resolveAdminFullName,
  resolveAdminProfileImage,
  resolveAdminUserRole,
  resolveAdminUserStatus,
} from "@/lib/utils/admin/admin-utils";
import { ModalFrame } from "@/components/ui/modal-frame";
import { formatDate } from "@/lib/utils/utils";

type AdminDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  detailLoading: boolean;
  detailRow: AdminProfile | null;
};

export function AdminDetailsModal({
  open,
  onClose,
  detailLoading,
  detailRow,
}: AdminDetailsModalProps) {
  return (
    <ModalFrame
      open={open}
      title="Admin Details"
      description="Single admin detail view."
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
            <AdminAvatar src={resolveAdminProfileImage(detailRow)} />
            <div>
              <p className="text-base font-semibold">
                {resolveAdminFullName(detailRow)}
              </p>
              <p className="text-xs text-(--text-dim)">
                {detailRow.designation}
              </p>
              <p className="text-xs text-(--text-dim)">{detailRow.email}</p>
            </div>
          </div>
          <p>
            <span className="font-semibold">Admin ID:</span> {detailRow.id}
          </p>
          <p>
            <span className="font-semibold">Gender:</span> {detailRow.gender}
          </p>
          <p>
            <span className="font-semibold">Blood Group:</span>{" "}
            {detailRow.bloogGroup ?? "-"}
          </p>
          <p>
            <span className="font-semibold">Date of Birth:</span>{" "}
            {formatDate(detailRow.dateOfBirth)}
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
            <span className="font-semibold">Account Status:</span>{" "}
            {resolveAdminUserStatus(detailRow)}
          </p>
          <p>
            <span className="font-semibold">Role:</span>{" "}
            {resolveAdminUserRole(detailRow)}
          </p>
        </div>
      ) : (
        <p className="text-sm text-(--text-dim)">No details available.</p>
      )}
    </ModalFrame>
  );
}

function AdminAvatar({ src }: { src: string | null }) {
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
