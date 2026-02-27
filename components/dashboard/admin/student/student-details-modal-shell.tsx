"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { StudentDetailsModalShellProps } from "@/lib/type/dashboard/admin/student/ui";

export function StudentDetailsModalShell({
  children,
}: StudentDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Student Details"
      description="View student information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
