import type { Metadata } from "next";
import { getPublicAcademicDepartments } from "@/lib/api/public/academic-department";
import { getPublicAcademicSemesters } from "@/lib/api/public/academic-semester";
import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import { PublicAcademicCalendarPage } from "@/components/public/public-academic-calendar-page";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicNavbar } from "@/components/public/public-navbar";

export const metadata: Metadata = {
  title: "Academic Calendar",
  description:
    "Live academic semester windows, public planning cues, and department-aligned calendar information for RPI Polytechnic.",
};

export default async function AcademicCalendarPage() {
  let semesters: AcademicSemester[] = [];
  let semesterError: string | null = null;
  let departments: AcademicDepartment[] = [];
  let departmentError: string | null = null;

  const [semesterResult, departmentResult] = await Promise.allSettled([
    getPublicAcademicSemesters({
      page: 1,
      limit: 100,
      sort: "name",
    }),
    getPublicAcademicDepartments({
      page: 1,
      limit: 12,
      sort: "name",
    }),
  ]);

  if (semesterResult.status === "fulfilled") {
    semesters = semesterResult.value.result ?? [];
  } else {
    semesterError =
      semesterResult.reason instanceof Error
        ? semesterResult.reason.message
        : "Academic semester data is not available for public access right now.";
  }

  if (departmentResult.status === "fulfilled") {
    departments = departmentResult.value.result ?? [];
  } else {
    departmentError =
      departmentResult.reason instanceof Error
        ? departmentResult.reason.message
        : "Failed to load public department data.";
  }

  return (
    <>
      <a href="#main-content" className="skip-link focus-ring">
        Skip to main content
      </a>
      <PublicNavbar />
      <main id="main-content" className="min-h-screen bg-(--bg) text-(--text)">
        <PublicAcademicCalendarPage
          semesters={semesters}
          semesterError={semesterError}
          departments={departments}
          departmentError={departmentError}
        />
      </main>
      <PublicFooter />
    </>
  );
}
