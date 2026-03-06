import type { Metadata } from "next";
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";
import { getDashboardSummaryServer } from "@/lib/api/dashboard/class-session/server";

export const metadata: Metadata = {
  title: "Admin Dashboard"
};

export default async function AdminDashboardPage() {
  const summary = await getDashboardSummaryServer();
  return <AdminDashboard summary={summary} />;
}
