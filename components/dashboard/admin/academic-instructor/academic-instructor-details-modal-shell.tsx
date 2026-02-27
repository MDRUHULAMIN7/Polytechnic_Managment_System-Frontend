"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { AcademicInstructorDetailsModalShellProps } from "@/lib/type/dashboard/admin/academic-instructor/ui";

export function AcademicInstructorDetailsModalShell({
  children,
}: AcademicInstructorDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Academic Instructor Details"
      description="View instructor information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
