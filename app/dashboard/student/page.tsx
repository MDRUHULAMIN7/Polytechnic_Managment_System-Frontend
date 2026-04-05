import type { Metadata } from "next";
import { StudentDashboard } from "@/components/dashboard/student/student-dashboard";
import {
  getDashboardSummaryServer,
  getStudentClassSessionsServer,
} from "@/lib/api/dashboard/class-session/server";
import { getMySemesterEnrollmentsServer } from "@/lib/api/dashboard/admin/semester-enrollment/server";
import { getMyAttendanceSummaryServer } from "@/lib/api/dashboard/student-attendance/server";
import { getLatestNoticesServer } from "@/lib/api/notice/server";
import type { SemesterEnrollment } from "@/lib/type/dashboard/admin/semester-enrollment";
import type { Notice } from "@/lib/type/notice";
import { resolveId } from "@/utils/dashboard/admin/utils";

export const metadata: Metadata = {
  title: "Student Dashboard"
};

type StudentOverview = {
  totalClasses: number;
  ongoingClasses: number;
  completedClasses: number;
  currentSemesterLabel: string;
  currentSemesterMeta: string;
};

async function loadHighlightNotice(): Promise<Notice | null> {
  try {
    const latest = await getLatestNoticesServer(5);
    return latest.pinned[0] ?? latest.latest[0] ?? null;
  } catch {
    return null;
  }
}

function humanizeEnum(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function hasOngoingRegistration(enrollment: SemesterEnrollment) {
  return (
    typeof enrollment.semesterRegistration !== "string" &&
    enrollment.semesterRegistration?.status === "ONGOING"
  );
}

function selectDashboardEnrollment(enrollments: SemesterEnrollment[]) {
  const approvedActive = enrollments.find(
    (item) => item.status === "APPROVED" && hasOngoingRegistration(item),
  );
  if (approvedActive) {
    return { enrollment: approvedActive, isCurrent: true };
  }

  const active = enrollments.find(hasOngoingRegistration);
  if (active) {
    return { enrollment: active, isCurrent: true };
  }

  const approved = enrollments.find((item) => item.status === "APPROVED");
  if (approved) {
    return { enrollment: approved, isCurrent: false };
  }

  return {
    enrollment: enrollments[0] ?? null,
    isCurrent: false,
  };
}

function resolveSemesterLabel(enrollment: SemesterEnrollment | null) {
  if (!enrollment) {
    return "No semester";
  }

  if (typeof enrollment.academicSemester === "string") {
    return enrollment.academicSemester || "Semester";
  }

  return (
    [enrollment.academicSemester?.name, enrollment.academicSemester?.year]
      .filter(Boolean)
      .join(" ") || "Semester"
  );
}

function resolveSemesterMeta(
  enrollment: SemesterEnrollment | null,
  isCurrent: boolean,
) {
  if (!enrollment) {
    return "Create a semester enrollment to see live class stats.";
  }

  const registration =
    typeof enrollment.semesterRegistration === "string"
      ? null
      : enrollment.semesterRegistration;

  const details = [
    registration?.status
      ? `${humanizeEnum(registration.status)} registration`
      : null,
    registration?.shift ? `${humanizeEnum(registration.shift)} shift` : null,
  ].filter(Boolean);

  if (details.length > 0) {
    return isCurrent
      ? details.join(" | ")
      : `Latest enrolled semester | ${details.join(" | ")}`;
  }

  return isCurrent
    ? `${humanizeEnum(enrollment.status)} enrollment`
    : `Latest enrolled semester | ${humanizeEnum(enrollment.status)} enrollment`;
}

async function loadOverview(): Promise<StudentOverview> {
  try {
    const semesterEnrollments = await getMySemesterEnrollmentsServer();
    const { enrollment, isCurrent } = selectDashboardEnrollment(semesterEnrollments);
    const semesterRegistrationId = resolveId(enrollment?.semesterRegistration);
    const baseParams = {
      page: 1,
      limit: 1,
      ...(semesterRegistrationId
        ? { semesterRegistration: semesterRegistrationId }
        : {}),
    };

    const [allClasses, ongoingClasses, completedClasses] = await Promise.all([
      getStudentClassSessionsServer(baseParams),
      getStudentClassSessionsServer({ ...baseParams, status: "ONGOING" }),
      getStudentClassSessionsServer({ ...baseParams, status: "COMPLETED" }),
    ]);

    return {
      totalClasses: allClasses.meta.total,
      ongoingClasses: ongoingClasses.meta.total,
      completedClasses: completedClasses.meta.total,
      currentSemesterLabel: resolveSemesterLabel(enrollment),
      currentSemesterMeta: resolveSemesterMeta(enrollment, isCurrent),
    };
  } catch {
    return {
      totalClasses: 0,
      ongoingClasses: 0,
      completedClasses: 0,
      currentSemesterLabel: "Unavailable",
      currentSemesterMeta: "Semester and class summary could not be loaded.",
    };
  }
}

export default async function StudentDashboardPage() {
  const [summary, attendanceSummary, highlightNotice, overview] = await Promise.all([
    getDashboardSummaryServer(),
    getMyAttendanceSummaryServer(),
    loadHighlightNotice(),
    loadOverview(),
  ]);

  return (
    <StudentDashboard
      summary={summary}
      overview={overview}
      attendanceSummary={attendanceSummary}
      highlightNotice={highlightNotice}
    />
  );
}
