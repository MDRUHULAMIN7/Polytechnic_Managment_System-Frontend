"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { SemesterEnrollmentDetailsModalShellProps } from "@/lib/type/dashboard/admin/semester-enrollment/ui";

export function SemesterEnrollmentDetailsModalShell({
  children,
}: SemesterEnrollmentDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Semester Enrollment Details"
      description="View semester enrollment information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
