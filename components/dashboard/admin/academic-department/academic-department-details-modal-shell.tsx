"use client";

import { useRouter } from "next/navigation";
import type { AcademicDepartmentDetailsModalShellProps } from "@/lib/type/dashboard/admin/academic-department/ui";
import { Modal } from "./modal";

export function AcademicDepartmentDetailsModalShell({
  children,
}: AcademicDepartmentDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Academic Department Details"
      description="View department information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
