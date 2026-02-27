import type { Metadata } from "next";
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard"
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
