"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { SubjectDetailsModalShellProps } from "@/lib/type/dashboard/admin/subject/ui";

export function SubjectDetailsModalShell({ children }: SubjectDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Subject Details"
      description="View subject information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
