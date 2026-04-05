import type { Metadata } from "next";
import { AdminDashboard } from "@/components/dashboard/admin/admin-dashboard";
import type { AdminDashboardOverview } from "@/components/dashboard/admin/admin-dashboard-types";
import { getAcademicSemestersServer } from "@/lib/api/dashboard/admin/academic-semester/server";
import { getAdminsServer } from "@/lib/api/dashboard/admin/admin/server";
import { getInstructorsServer } from "@/lib/api/dashboard/admin/instructor/server";
import { getOfferedSubjectsServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import { getSemesterRegistrationsServer } from "@/lib/api/dashboard/admin/semester-registration/server";
import { getStudentsServer } from "@/lib/api/dashboard/admin/student/server";
import { getSubjectsServer } from "@/lib/api/dashboard/admin/subject/server";
import {
  getAdminClassSessionsServer,
  getDashboardSummaryServer,
} from "@/lib/api/dashboard/class-session/server";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import type {
  SemesterRegistration,
  SemesterRegistrationStatus,
} from "@/lib/type/dashboard/admin/semester-registration";
import type {
  ClassSession,
  ClassSessionListParams,
} from "@/lib/type/dashboard/class-session";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export const revalidate = 60;

const DASHBOARD_TIME_ZONE = "Asia/Dhaka";
const PAGE_SIZE = 100;

function formatApiDate(value: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: DASHBOARD_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function shiftDate(value: Date, amount: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatChartLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function resolveDateKey(value?: string) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.slice(0, 10);
  }

  return formatApiDate(parsed);
}

function resolveEntityId(value?: { _id?: string } | string) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value._id ?? null;
}

function resolveAcademicSemesterLabel(
  value?:
    | OfferedSubject["academicSemester"]
    | SemesterRegistration["academicSemester"]
    | string,
) {
  if (!value) {
    return "Unassigned semester";
  }

  if (typeof value === "string") {
    return value;
  }

  return [value.name, value.year].filter(Boolean).join(" ") || "Unassigned semester";
}

function resolveRegistration(
  value: OfferedSubject["semesterRegistration"],
  registrationMap: Map<string, SemesterRegistration>,
) {
  if (typeof value !== "string") {
    return value;
  }

  return registrationMap.get(value);
}

async function fetchAllOfferedSubjects() {
  const firstPage = await getOfferedSubjectsServer({
    page: 1,
    limit: PAGE_SIZE,
  });

  if (firstPage.meta.totalPage <= 1) {
    return firstPage.result;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPage - 1 }, (_, index) =>
      getOfferedSubjectsServer({
        page: index + 2,
        limit: PAGE_SIZE,
      }),
    ),
  );

  return [...firstPage.result, ...remainingPages.flatMap((page) => page.result)];
}

async function fetchAllSemesterRegistrations() {
  const firstPage = await getSemesterRegistrationsServer({
    page: 1,
    limit: PAGE_SIZE,
  });

  if (firstPage.meta.totalPage <= 1) {
    return firstPage.result;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPage - 1 }, (_, index) =>
      getSemesterRegistrationsServer({
        page: index + 2,
        limit: PAGE_SIZE,
      }),
    ),
  );

  return [...firstPage.result, ...remainingPages.flatMap((page) => page.result)];
}

async function fetchAllClassSessions(
  params: Omit<ClassSessionListParams, "page" | "limit">,
) {
  const firstPage = await getAdminClassSessionsServer({
    ...params,
    page: 1,
    limit: 200,
  });

  if (firstPage.meta.totalPage <= 1) {
    return firstPage.result;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: firstPage.meta.totalPage - 1 }, (_, index) =>
      getAdminClassSessionsServer({
        ...params,
        page: index + 2,
        limit: 200,
      }),
    ),
  );

  return [...firstPage.result, ...remainingPages.flatMap((page) => page.result)];
}

function percentage(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

function decimalRatio(value: number) {
  if (!Number.isFinite(value)) {
    return "0.0";
  }

  return value.toFixed(1);
}

export default async function AdminDashboardPage() {
  const today = new Date();
  const recentDateKeys = Array.from({ length: 7 }, (_, index) =>
    formatApiDate(shiftDate(today, index - 6)),
  );
  const recentStartDate = recentDateKeys[0] ?? formatApiDate(today);
  const recentEndDate = recentDateKeys[recentDateKeys.length - 1] ?? formatApiDate(today);

  const [
    summary,
    studentPayload,
    instructorPayload,
    subjectPayload,
    academicSemesterPayload,
    adminPayload,
    offeredSubjects,
    semesterRegistrations,
    scheduledPayload,
    ongoingPayload,
    completedPayload,
    cancelledPayload,
    missedPayload,
    recentSessions,
  ] = await Promise.all([
    getDashboardSummaryServer(),
    getStudentsServer({ page: 1, limit: 1 }),
    getInstructorsServer({ page: 1, limit: 1 }),
    getSubjectsServer({ page: 1, limit: 1 }),
    getAcademicSemestersServer({ page: 1, limit: 1 }),
    getAdminsServer({ page: 1, limit: 1 }),
    fetchAllOfferedSubjects(),
    fetchAllSemesterRegistrations(),
    getAdminClassSessionsServer({ page: 1, limit: 1, status: "SCHEDULED" }),
    getAdminClassSessionsServer({ page: 1, limit: 1, status: "ONGOING" }),
    getAdminClassSessionsServer({ page: 1, limit: 1, status: "COMPLETED" }),
    getAdminClassSessionsServer({ page: 1, limit: 1, status: "CANCELLED" }),
    getAdminClassSessionsServer({ page: 1, limit: 1, status: "MISSED" }),
    fetchAllClassSessions({
      startDate: recentStartDate,
      endDate: recentEndDate,
    }),
  ]);

  const studentsTotal = studentPayload.meta.total;
  const instructorsTotal = instructorPayload.meta.total;
  const subjectsTotal = subjectPayload.meta.total;
  const academicSemestersTotal = academicSemesterPayload.meta.total;
  const adminsTotal = adminPayload.meta.total;

  const classStatusTotals = {
    scheduled: scheduledPayload.meta.total,
    ongoing: ongoingPayload.meta.total,
    completed: completedPayload.meta.total,
    cancelled: cancelledPayload.meta.total,
    missed: missedPayload.meta.total,
  };

  const totalClasses =
    classStatusTotals.scheduled +
    classStatusTotals.ongoing +
    classStatusTotals.completed +
    classStatusTotals.cancelled +
    classStatusTotals.missed;

  const registrationStatusCounts: Record<SemesterRegistrationStatus, number> = {
    UPCOMING: 0,
    ONGOING: 0,
    ENDED: 0,
  };
  const registrationMap = new Map<string, SemesterRegistration>();

  for (const registration of semesterRegistrations) {
    registrationStatusCounts[registration.status] += 1;
    registrationMap.set(registration._id, registration);
  }

  const semesterGroups = new Map<
    string,
    {
      label: string;
      offeredSubjects: number;
      subjectIds: Set<string>;
      instructorIds: Set<string>;
      registrationIds: Set<string>;
      currentWindows: number;
    }
  >();
  const uniqueOfferedSubjectIds = new Set<string>();

  for (const offeredSubject of offeredSubjects) {
    const registration = resolveRegistration(
      offeredSubject.semesterRegistration,
      registrationMap,
    );
    const semesterSource =
      typeof offeredSubject.academicSemester === "string"
        ? registration?.academicSemester ?? offeredSubject.academicSemester
        : offeredSubject.academicSemester;
    const semesterLabel = resolveAcademicSemesterLabel(semesterSource);
    const semesterKey = resolveEntityId(semesterSource) ?? semesterLabel;
    const bucket = semesterGroups.get(semesterKey) ?? {
      label: semesterLabel,
      offeredSubjects: 0,
      subjectIds: new Set<string>(),
      instructorIds: new Set<string>(),
      registrationIds: new Set<string>(),
      currentWindows: 0,
    };

    bucket.offeredSubjects += 1;

    const subjectId = resolveEntityId(offeredSubject.subject);
    const instructorId = resolveEntityId(offeredSubject.instructor);
    const registrationId = resolveEntityId(offeredSubject.semesterRegistration);

    if (subjectId) {
      bucket.subjectIds.add(subjectId);
      uniqueOfferedSubjectIds.add(subjectId);
    }

    if (instructorId) {
      bucket.instructorIds.add(instructorId);
    }

    if (registrationId && !bucket.registrationIds.has(registrationId)) {
      bucket.registrationIds.add(registrationId);

      if (registration?.status === "ONGOING") {
        bucket.currentWindows += 1;
      }
    }

    semesterGroups.set(semesterKey, bucket);
  }

  const semesterInsights = Array.from(semesterGroups.values())
    .sort((a, b) => b.offeredSubjects - a.offeredSubjects || a.label.localeCompare(b.label))
    .slice(0, 5)
    .map((item) => ({
      label: item.label,
      meta: `${item.registrationIds.size} window${item.registrationIds.size === 1 ? "" : "s"} mapped`,
      offeredSubjects: item.offeredSubjects,
      uniqueSubjects: item.subjectIds.size,
      uniqueInstructors: item.instructorIds.size,
      registrationWindows: item.registrationIds.size,
      currentWindows: item.currentWindows,
      href: "/dashboard/admin/offered-subjects",
    }));

  const semesterOfferings = Array.from(semesterGroups.values())
    .sort((a, b) => b.offeredSubjects - a.offeredSubjects || a.label.localeCompare(b.label))
    .slice(0, 6)
    .map((item) => ({
      label: item.label,
      sections: item.offeredSubjects,
      subjects: item.subjectIds.size,
      instructors: item.instructorIds.size,
    }));

  const recentSessionCounts = new Map<
    string,
    {
      total: number;
      completed: number;
      disrupted: number;
    }
  >();

  for (const dateKey of recentDateKeys) {
    recentSessionCounts.set(dateKey, {
      total: 0,
      completed: 0,
      disrupted: 0,
    });
  }

  for (const session of recentSessions) {
    const dateKey = resolveDateKey(session.date);
    if (!dateKey) {
      continue;
    }

    const bucket = recentSessionCounts.get(dateKey);
    if (!bucket) {
      continue;
    }

    bucket.total += 1;

    if (session.status === "COMPLETED") {
      bucket.completed += 1;
    }

    if (session.status === "CANCELLED" || session.status === "MISSED") {
      bucket.disrupted += 1;
    }
  }

  const recentActivity = recentDateKeys.map((dateKey) => {
    const item = recentSessionCounts.get(dateKey) ?? {
      total: 0,
      completed: 0,
      disrupted: 0,
    };

    return {
      label: formatChartLabel(dateKey),
      total: item.total,
      completed: item.completed,
      disrupted: item.disrupted,
    };
  });

  const ongoingRegistrations = registrationStatusCounts.ONGOING;
  const coveredSemesterCount = semesterGroups.size;
  const currentSections = Array.from(semesterGroups.values()).reduce(
    (sum, item) => sum + (item.currentWindows > 0 ? item.offeredSubjects : 0),
    0,
  );
  const averageSectionsPerSubject = decimalRatio(
    uniqueOfferedSubjectIds.size === 0
      ? 0
      : offeredSubjects.length / uniqueOfferedSubjectIds.size,
  );
  const studentInstructorRatio = decimalRatio(
    instructorsTotal === 0 ? 0 : studentsTotal / instructorsTotal,
  );
  const overallCompletionRate = percentage(classStatusTotals.completed, totalClasses);
  const todayDisrupted = summary.sessions.filter(
    (session: ClassSession) =>
      session.status === "CANCELLED" || session.status === "MISSED",
  ).length;
  const todayCompletionRate = percentage(summary.completed, summary.totalToday);

  const overview: AdminDashboardOverview = {
    cards: [
      {
        label: "Total Students",
        value: studentsTotal,
        helper: "Student profiles registered across the platform.",
        href: "/dashboard/admin/students",
        tone: "primary",
      },
      {
        label: "Total Instructors",
        value: instructorsTotal,
        helper: "Faculty records available for academic allocation.",
        href: "/dashboard/admin/instructors",
        tone: "accent",
      },
      {
        label: "Subject Catalog",
        value: subjectsTotal,
        helper: "Core subject inventory maintained in the academic library.",
        href: "/dashboard/admin/subjects",
        tone: "sky",
      },
      {
        label: "Offered Subjects",
        value: offeredSubjects.length,
        helper: "Live section offerings distributed across current registrations.",
        href: "/dashboard/admin/offered-subjects",
        tone: "amber",
      },
      {
        label: "Semester Windows",
        value: semesterRegistrations.length,
        helper: `${ongoingRegistrations} active registration window${ongoingRegistrations === 1 ? "" : "s"} right now.`,
        href: "/dashboard/admin/semester-registrations",
        tone: "emerald",
      },
      {
        label: "Academic Semesters",
        value: academicSemestersTotal,
        helper: `${coveredSemesterCount} semester${coveredSemesterCount === 1 ? "" : "s"} currently carrying live offerings.`,
        href: "/dashboard/admin/academic-semesters",
        tone: "slate",
      },
    ],
    quickMetrics: [
      {
        label: "Total Classes",
        value: totalClasses.toLocaleString("en-US"),
        helper: "All class sessions tracked in the monitoring layer.",
      },
      {
        label: "Live Today",
        value: summary.ongoing.toLocaleString("en-US"),
        helper: "Sessions currently active in today's teaching cycle.",
      },
      {
        label: "Completion Rate",
        value: `${overallCompletionRate}%`,
        helper: "Share of class sessions that have already been delivered.",
      },
      {
        label: "Active Windows",
        value: ongoingRegistrations.toLocaleString("en-US"),
        helper: "Semester registration windows currently open for operations.",
      },
    ],
    websiteStats: [
      {
        label: "Admin Team",
        value: adminsTotal.toLocaleString("en-US"),
        helper: "Administrators with oversight across platform workflows.",
      },
      {
        label: "Student : Instructor",
        value: `${studentInstructorRatio}:1`,
        helper: "Enrollment-to-faculty ratio based on registered profiles.",
      },
      {
        label: "Sections per Subject",
        value: `${averageSectionsPerSubject}x`,
        helper: "Average section count generated for each offered subject family.",
      },
      {
        label: "Semester Coverage",
        value: `${coveredSemesterCount}/${academicSemestersTotal}`,
        helper: "Academic semesters currently carrying live teaching sections.",
      },
      {
        label: "Current Teaching Load",
        value: currentSections.toLocaleString("en-US"),
        helper: "Sections linked to ongoing semester registration windows.",
      },
      {
        label: "Today Delivery Rate",
        value: `${todayCompletionRate}%`,
        helper: `${todayDisrupted} disrupted session${todayDisrupted === 1 ? "" : "s"} detected in today's queue.`,
      },
    ],
    classStatusData: [
      { label: "Scheduled", value: classStatusTotals.scheduled },
      { label: "Ongoing", value: classStatusTotals.ongoing },
      { label: "Completed", value: classStatusTotals.completed },
      { label: "Cancelled", value: classStatusTotals.cancelled },
      { label: "Missed", value: classStatusTotals.missed },
    ],
    registrationStatusData: [
      { label: "Upcoming", value: registrationStatusCounts.UPCOMING },
      { label: "Ongoing", value: registrationStatusCounts.ONGOING },
      { label: "Ended", value: registrationStatusCounts.ENDED },
    ],
    recentActivity,
    semesterOfferings,
    semesterInsights,
  };

  return <AdminDashboard summary={summary} overview={overview} />;
}
