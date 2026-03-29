import type { Metadata } from "next";
import { PublicAcademicInstructorDetailPage } from "@/components/public/public-academic-instructor-detail-page";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";
import { getPublicInstructor } from "@/lib/api/public/instructor";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

type AcademicInstructorDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Instructor Profile",
  description:
    "Public instructor profile with department alignment and institutional directory context.",
};

export default async function AcademicInstructorDetailPage({
  params,
}: AcademicInstructorDetailPageProps) {
  const { id } = await params;
  let instructor: Instructor | null = null;
  let error: string | null = null;

  const [instructorResult] = await Promise.allSettled([getPublicInstructor(id)]);

  if (instructorResult.status === "fulfilled") {
    instructor = instructorResult.value;
  } else {
    error =
      instructorResult.reason instanceof Error
        ? instructorResult.reason.message
        : "Failed to load instructor profile.";
  }

  return (
    <>
      <a href="#main-content" className="skip-link focus-ring">
        Skip to main content
      </a>
      <PublicNavbar />
      <main id="main-content" className="min-h-screen bg-(--bg) text-(--text)">
        <PublicAcademicInstructorDetailPage
          instructor={instructor}
          error={error}
        />
      </main>
      <PublicFooter />
    </>
  );
}
