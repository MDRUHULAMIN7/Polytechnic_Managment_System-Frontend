import type { Metadata } from "next";
import { InstructorMarkingPageServer } from "@/components/dashboard/instructor/marking/instructor-marking-page-server";

export const metadata: Metadata = {
  title: "Student Marking",
};

export default async function InstructorMarksPage() {
  return <InstructorMarkingPageServer />;
}
