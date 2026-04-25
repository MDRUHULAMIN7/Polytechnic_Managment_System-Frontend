import type { Metadata } from "next";
import { AdminMarkingPageServer } from "@/components/dashboard/admin/marking/admin-marking-page-server";

export const metadata: Metadata = {
  title: "Student Marking",
};

export default async function AdminMarksPage() {
  return <AdminMarkingPageServer />;
}
