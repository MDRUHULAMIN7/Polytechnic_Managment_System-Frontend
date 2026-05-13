import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Curriculum Planning",
  description: "Multi-step AI curriculum planning with conflict detection and resolution",
};

export default function CurriculumPlanningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
