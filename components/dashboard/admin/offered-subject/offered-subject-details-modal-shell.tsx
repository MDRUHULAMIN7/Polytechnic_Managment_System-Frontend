"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { OfferedSubjectDetailsModalShellProps } from "@/lib/type/dashboard/admin/offered-subject/ui";

export function OfferedSubjectDetailsModalShell({
  children,
}: OfferedSubjectDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Offered Subject Details"
      description="View offered subject information"
      onClose={() => router.back()}
      maxWidth="max-w-4xl"
    >
      {children}
    </Modal>
  );
}
