import type { Metadata } from "next";
import { InstructorDashboard } from "@/components/dashboard/instructor/instructor-dashboard";
import { getDashboardSummaryServer } from "@/lib/api/dashboard/class-session/server";

export const metadata: Metadata = {
  title: "Instructor Dashboard"
};

export default async function InstructorDashboardPage() {
  const summary = await getDashboardSummaryServer();
  return <InstructorDashboard summary={summary} />;
}
