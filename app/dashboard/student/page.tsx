import type { Metadata } from "next";
import { StudentDashboard } from "@/components/dashboard/student/student-dashboard";

export const metadata: Metadata = {
  title: "Student Dashboard"
};

export default function StudentDashboardPage() {
  return <StudentDashboard />;
}
