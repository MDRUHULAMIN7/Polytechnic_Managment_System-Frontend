import type { Metadata } from "next";
import {
  InstructorDashboard,
  type InstructorDashboardOverview,
} from "@/components/dashboard/instructor/instructor-dashboard";
import {
  getDashboardSummaryServer,
  getInstructorClassSessionsServer,
} from "@/lib/api/dashboard/class-session/server";
import { getOfferedSubjectsServer } from "@/lib/api/dashboard/admin/offered-subject/server";
import { getSubjectsServer } from "@/lib/api/dashboard/admin/subject/server";
import type { ClassSession } from "@/lib/type/dashboard/class-session";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";
import { resolveId } from "@/utils/dashboard/admin/utils";

export const metadata: Metadata = {
  title: "Instructor Dashboard",
};

function todayDateParam() {
  return new Date().toISOString().slice(0, 10);
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

function pluralize(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function resolveSubjectLabel(subject: OfferedSubject["subject"]) {
  if (typeof subject === "string") {
    return subject || "Subject";
  }

  return [subject?.title, subject?.code].filter(Boolean).join(" | ") || "Subject";
}

function resolveAcademicSemesterLabel(semester: OfferedSubject["academicSemester"]) {
  if (typeof semester === "string") {
    return semester || "Semester";
  }

  return [semester?.name, semester?.year].filter(Boolean).join(" ") || "Semester";
}

function resolveSemesterRegistrationMeta(
  registration: OfferedSubject["semesterRegistration"],
) {
  if (typeof registration === "string") {
    return {
      label: registration || "Assigned registration",
      isCurrent: false,
      registrationKey: registration || "registration",
    };
  }

  const parts = [
    registration?.status ? humanizeEnum(registration.status) : null,
    registration?.shift ? humanizeEnum(registration.shift) : null,
  ].filter(Boolean);

  return {
    label: parts.join(" | ") || "Assigned registration",
    isCurrent: registration?.status === "ONGOING",
    registrationKey:
      resolveId(registration) ??
      `${registration?.status ?? "status"}-${registration?.shift ?? "shift"}`,
  };
}

function resolveScheduleLabel(item: OfferedSubject) {
  const days = item.days?.length ? item.days.join(", ") : "Days not set";
  const time =
    item.startTime && item.endTime
      ? `${item.startTime} - ${item.endTime}`
      : "Time not set";

  return `${days} | ${time}`;
}

async function loadAllMyOfferedSubjects(): Promise<OfferedSubject[]> {
  const firstPage = await getOfferedSubjectsServer({
    scope: "my",
    sort: "-createdAt",
    page: 1,
    limit: 100,
  });

  const totalPages = Math.max(firstPage.meta.totalPage ?? 1, 1);

  if (totalPages === 1) {
    return firstPage.result ?? [];
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getOfferedSubjectsServer({
        scope: "my",
        sort: "-createdAt",
        page: index + 2,
        limit: 100,
      }),
    ),
  );

  return [
    ...(firstPage.result ?? []),
    ...remainingPages.flatMap((page) => page.result ?? []),
  ];
}

function buildInstructorOverview(params: {
  offeredSubjects: OfferedSubject[];
  assignedSubjects: number;
  scheduledClasses: number;
  completedClasses: number;
  liveClasses: number;
}): InstructorDashboardOverview {
  const {
    offeredSubjects,
    assignedSubjects,
    scheduledClasses,
    completedClasses,
    liveClasses,
  } = params;

  const semesterGroups = new Map<
    string,
    {
      label: string;
      sectionCount: number;
      registrationKeys: Set<string>;
      isCurrent: boolean;
    }
  >();
  const registrationKeys = new Set<string>();

  for (const item of offeredSubjects) {
    const semesterKey =
      resolveId(item.academicSemester) ?? resolveAcademicSemesterLabel(item.academicSemester);
    const semesterLabel = resolveAcademicSemesterLabel(item.academicSemester);
    const registration = resolveSemesterRegistrationMeta(item.semesterRegistration);

    registrationKeys.add(registration.registrationKey);

    const existing = semesterGroups.get(semesterKey);
    if (existing) {
      existing.sectionCount += 1;
      existing.registrationKeys.add(registration.registrationKey);
      existing.isCurrent = existing.isCurrent || registration.isCurrent;
    } else {
      semesterGroups.set(semesterKey, {
        label: semesterLabel,
        sectionCount: 1,
        registrationKeys: new Set([registration.registrationKey]),
        isCurrent: registration.isCurrent,
      });
    }
  }

  const semesterCoverage = Array.from(semesterGroups.values())
    .sort(
      (left, right) =>
        Number(right.isCurrent) - Number(left.isCurrent) ||
        left.label.localeCompare(right.label),
    )
    .map((group) => ({
      label: group.label,
      sectionCount: group.sectionCount,
      registrationCount: group.registrationKeys.size,
      isCurrent: group.isCurrent,
      meta: `${pluralize(group.sectionCount, "section")} | ${pluralize(
        group.registrationKeys.size,
        "registration window",
      )}`,
    }));

  return {
    assignedSubjects,
    assignedSemesters: semesterCoverage.length,
    assignedRegistrations: registrationKeys.size,
    assignedSections: offeredSubjects.length,
    scheduledClasses,
    completedClasses,
    liveClasses,
    teachingAssignments: offeredSubjects.slice(0, 6).map((item) => {
      const registration = resolveSemesterRegistrationMeta(item.semesterRegistration);

      return {
        id: item._id,
        subjectLabel: resolveSubjectLabel(item.subject),
        semesterLabel: resolveAcademicSemesterLabel(item.academicSemester),
        registrationMeta: registration.label,
        scheduleLabel: resolveScheduleLabel(item),
        sectionLabel: item.section ? `Section ${item.section}` : "Section --",
        detailHref: `/dashboard/instructor/offered-subjects/${item._id}`,
      };
    }),
    semesterCoverage,
  };
}

async function loadInstructorOverview(): Promise<InstructorDashboardOverview> {
  try {
    const [
      subjectsPayload,
      scheduledPayload,
      completedPayload,
      livePayload,
      offeredSubjects,
    ] = await Promise.all([
      getSubjectsServer({
        scope: "my",
        page: 1,
        limit: 1,
        sort: "-title",
      }),
      getInstructorClassSessionsServer({
        page: 1,
        limit: 1,
        status: "SCHEDULED",
      }),
      getInstructorClassSessionsServer({
        page: 1,
        limit: 1,
        status: "COMPLETED",
      }),
      getInstructorClassSessionsServer({
        page: 1,
        limit: 1,
        status: "ONGOING",
      }),
      loadAllMyOfferedSubjects(),
    ]);

    return buildInstructorOverview({
      offeredSubjects,
      assignedSubjects: subjectsPayload.meta.total,
      scheduledClasses: scheduledPayload.meta.total,
      completedClasses: completedPayload.meta.total,
      liveClasses: livePayload.meta.total,
    });
  } catch {
    return {
      assignedSubjects: 0,
      assignedSemesters: 0,
      assignedRegistrations: 0,
      assignedSections: 0,
      scheduledClasses: 0,
      completedClasses: 0,
      liveClasses: 0,
      teachingAssignments: [],
      semesterCoverage: [],
    };
  }
}

async function loadTodayClasses(): Promise<ClassSession[]> {
  try {
    const today = todayDateParam();
    const payload = await getInstructorClassSessionsServer({
      page: 1,
      limit: 8,
      startDate: today,
      endDate: today,
    });

    return payload.result ?? [];
  } catch {
    return [];
  }
}

export default async function InstructorDashboardPage() {
  const [summary, overview, todayClasses] = await Promise.all([
    getDashboardSummaryServer(),
    loadInstructorOverview(),
    loadTodayClasses(),
  ]);

  return (
    <InstructorDashboard
      summary={summary}
      overview={overview}
      todayClasses={todayClasses}
    />
  );
}
