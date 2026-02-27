"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { InstructorDetailsModalShellProps } from "@/lib/type/dashboard/admin/instructor/ui";

export function InstructorDetailsModalShell({
  children,
}: InstructorDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Instructor Details"
      description="View instructor information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
