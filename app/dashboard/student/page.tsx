import type { Metadata } from "next";
import { StudentDashboard } from "@/components/dashboard/student/student-dashboard";
import { getDashboardSummaryServer } from "@/lib/api/dashboard/class-session/server";
import { getMyAttendanceSummaryServer } from "@/lib/api/dashboard/student-attendance/server";

export const metadata: Metadata = {
  title: "Student Dashboard"
};

export default async function StudentDashboardPage() {
  const [summary, attendanceSummary] = await Promise.all([
    getDashboardSummaryServer(),
    getMyAttendanceSummaryServer(),
  ]);

  return <StudentDashboard summary={summary} attendanceSummary={attendanceSummary} />;
}
