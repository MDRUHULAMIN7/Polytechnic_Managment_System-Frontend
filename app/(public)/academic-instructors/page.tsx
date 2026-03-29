import type { Metadata } from "next";
import { PublicAcademicInstructorsPage } from "@/components/public/public-academic-instructors-page";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";
import { getPublicInstructors } from "@/lib/api/public/instructor";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

export const metadata: Metadata = {
  title: "Instructors",
  description:
    "Explore the public instructor directory with live backend data, department alignment, and editorial faculty presentation.",
};

export default async function AcademicInstructorsPage() {
  let instructors: Instructor[] = [];
  let instructorError: string | null = null;

  try {
    const result = await getPublicInstructors({
      page: 1,
      limit: 500,
      sort: "-createdAt",
    });
    instructors = result.result ?? [];
  } catch (error) {
    instructorError =
      error instanceof Error
        ? error.message
        : "Failed to load instructors.";
  }

  return (
    <>
      <a href="#main-content" className="skip-link focus-ring">
        Skip to main content
      </a>
      <PublicNavbar />
      <main id="main-content" className="min-h-screen bg-(--bg) text-(--text)">
        <PublicAcademicInstructorsPage
          instructors={instructors}
          instructorError={instructorError}
        />
      </main>
      <PublicFooter />
    </>
  );
}
