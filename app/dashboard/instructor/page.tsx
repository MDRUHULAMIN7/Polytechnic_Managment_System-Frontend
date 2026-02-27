import type { Metadata } from "next";
import { InstructorDashboard } from "@/components/dashboard/instructor/instructor-dashboard";

export const metadata: Metadata = {
  title: "Instructor Dashboard"
};

export default function InstructorDashboardPage() {
  return <InstructorDashboard />;
}
