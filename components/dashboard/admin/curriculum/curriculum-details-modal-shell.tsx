"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { CurriculumDetailsModalShellProps } from "@/lib/type/dashboard/admin/curriculum/ui";

export function CurriculumDetailsModalShell({ children }: CurriculumDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Curriculum Details"
      description="View curriculum information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
