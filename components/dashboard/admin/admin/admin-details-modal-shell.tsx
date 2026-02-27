"use client";

import { useRouter } from "next/navigation";
import { Modal } from "./modal";
import type { AdminDetailsModalShellProps } from "@/lib/type/dashboard/admin/admin/ui";

export function AdminDetailsModalShell({ children }: AdminDetailsModalShellProps) {
  const router = useRouter();

  return (
    <Modal
      open
      title="Admin Details"
      description="View admin information"
      onClose={() => router.back()}
    >
      {children}
    </Modal>
  );
}
