"use client";

import { useRouter } from "next/navigation";
import type { AcademicSemesterDetailsModalShellProps } from "@/lib/type/dashboard/admin/academic-semester/ui";
import { Modal } from "./modal";

export function AcademicSemesterDetailsModalShell({
  children,
}: AcademicSemesterDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Academic Semester Details"
      description="View semester information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
