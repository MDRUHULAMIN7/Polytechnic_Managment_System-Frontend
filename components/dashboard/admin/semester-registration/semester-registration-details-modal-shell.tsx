"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { SemesterRegistrationDetailsModalShellProps } from "@/lib/type/dashboard/admin/semester-registration/ui";

export function SemesterRegistrationDetailsModalShell({
  children,
}: SemesterRegistrationDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Semester Registration Details"
      description="View semester registration information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
