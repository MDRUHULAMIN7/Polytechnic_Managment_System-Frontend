import type {
  AcademicDepartment,
  AcademicInstructor,
  AcademicSemester,
  ApiMeta,
  OfferedSubject,
  OfferedSubjectDay,
  SemesterRegistration,
  SubjectProfile,
  InstructorProfile,
} from "@/lib/api/types";
import type { ServerListState } from "@/lib/list-query";
import type {
  OfferedSubjectFormValues,
  OfferedSubjectInstructorOption,
  OfferedSubjectSort,
  OfferedSubjectSubjectOption,
  OfferedSubjectSemesterRegistrationOption,
} from "@/lib/types/pages/offered-subject/offered-subject.types";

export const OFFERED_SUBJECT_DAYS: readonly OfferedSubjectDay[] = [
  "Sat",
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
];

export const OFFERED_SUBJECT_SORT_OPTIONS: readonly OfferedSubjectSort[] = [
  "-createdAt",
  "createdAt",
  "-section",
  "section",
];
export const OFFERED_SUBJECT_ROWS_PER_PAGE = [5, 10, 20] as const;
export const OFFERED_SUBJECT_TABLE_FIELDS = [
  "_id",
  "academicSemester",
  "academicDepartment",
  "subject",
  "instructor",
  "maxCapacity",
  "section",
  "days",
  "startTime",
  "endTime",
] as const;

export const OFFERED_SUBJECT_DEFAULT_TABLE_STATE: ServerListState = {
  searchTerm: "",
  sort: "-createdAt",
  page: 1,
  limit: 10,
};

export const OFFERED_SUBJECT_DEFAULT_META: ApiMeta = {
  page: OFFERED_SUBJECT_DEFAULT_TABLE_STATE.page,
  limit: OFFERED_SUBJECT_DEFAULT_TABLE_STATE.limit,
  total: 0,
  totalPage: 1,
};

export const EMPTY_OFFERED_SUBJECT_FORM: OfferedSubjectFormValues = {
  semesterRegistration: "",
  academicInstructor: "",
  academicDepartment: "",
  subject: "",
  instructor: "",
  section: "",
  maxCapacity: "",
  days: [],
  startTime: "",
  endTime: "",
};

export function isOfferedSubjectDay(value: string): value is OfferedSubjectDay {
  return OFFERED_SUBJECT_DAYS.includes(value as OfferedSubjectDay);
}

export function parsePositiveInteger(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return Math.floor(parsed);
}

function resolveRelationId(
  value: string | { _id: string } | null | undefined,
): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id;
}

export function resolveAcademicSemesterLabel(
  academicSemester: string | AcademicSemester | null | undefined,
) {
  if (!academicSemester) return "-";
  if (typeof academicSemester === "string") return academicSemester;
  return `${academicSemester.name} (${academicSemester.code}) ${academicSemester.year}`;
}

export function resolveAcademicSemesterName(
  academicSemester: string | AcademicSemester | null | undefined,
) {
  if (!academicSemester) return "-";
  if (typeof academicSemester === "string") return academicSemester;
  if (!academicSemester.name) return "-";
  return academicSemester.year
    ? `${academicSemester.name} ${academicSemester.year}`
    : academicSemester.name;
}

export function resolveSubjectLabel(
  subject: string | SubjectProfile | null | undefined,
) {
  if (!subject) return "-";
  if (typeof subject === "string") return subject;
  return `${subject.prefix}${subject.code} - ${subject.title}`;
}

export function resolveSubjectTitle(
  subject: string | SubjectProfile | null | undefined,
) {
  if (!subject) return "-";
  if (typeof subject === "string") return subject;
  return subject.title || "-";
}

export function resolveInstructorLabel(
  instructor: string | InstructorProfile | null | undefined,
) {
  if (!instructor) return "-";
  if (typeof instructor === "string") return instructor;
  const first = instructor.name?.firstName?.trim() ?? "";
  const middle = instructor.name?.middleName?.trim() ?? "";
  const last = instructor.name?.lastName?.trim() ?? "";
  const fullName = [first, middle, last].filter(Boolean).join(" ");
  return fullName || instructor.id || instructor._id;
}

export function resolveAcademicDepartmentLabel(
  department: string | AcademicDepartment | null | undefined,
) {
  if (!department) return "-";
  if (typeof department === "string") return department;
  return department.name || "-";
}

export function resolveAcademicInstructorLabel(
  academicInstructor: string | AcademicInstructor | null | undefined,
) {
  if (!academicInstructor) return "-";
  if (typeof academicInstructor === "string") return academicInstructor;
  return academicInstructor.name || "-";
}

export function resolveSemesterRegistrationLabel(
  semesterRegistration:
    | string
    | Pick<
        SemesterRegistration,
        "_id" | "academicSemester" | "shift" | "status"
      >
    | null
    | undefined,
) {
  if (!semesterRegistration) return "-";
  if (typeof semesterRegistration === "string") return semesterRegistration;

  const semester = resolveAcademicSemesterLabel(semesterRegistration.academicSemester);
  return `${semester} | ${semesterRegistration.shift} | ${semesterRegistration.status}`;
}

export function resolveSemesterNameFromSemesterRegistration(
  semesterRegistration:
    | string
    | Pick<SemesterRegistration, "academicSemester">
    | null
    | undefined,
) {
  if (!semesterRegistration) return "-";
  if (typeof semesterRegistration === "string") return semesterRegistration;
  return resolveAcademicSemesterName(semesterRegistration.academicSemester);
}

export function resolveSemesterShiftFromSemesterRegistration(
  semesterRegistration:
    | string
    | Pick<SemesterRegistration, "shift">
    | null
    | undefined,
) {
  if (!semesterRegistration || typeof semesterRegistration === "string") return "-";
  return semesterRegistration.shift || "-";
}

export function resolveSemesterStatusFromSemesterRegistration(
  semesterRegistration:
    | string
    | Pick<SemesterRegistration, "status">
    | null
    | undefined,
) {
  if (!semesterRegistration || typeof semesterRegistration === "string") return "-";
  return semesterRegistration.status || "-";
}

export function resolveSubjectOptionLabel(row: OfferedSubjectSubjectOption) {
  return `${row.prefix}${row.code} - ${row.title}`;
}

export function resolveInstructorOptionLabel(
  row: OfferedSubjectInstructorOption,
) {
  const first = row.name?.firstName?.trim() ?? "";
  const middle = row.name?.middleName?.trim() ?? "";
  const last = row.name?.lastName?.trim() ?? "";
  const fullName = [first, middle, last].filter(Boolean).join(" ");
  return `${fullName || row.id} (${row.designation})`;
}

export function resolveSemesterRegistrationOptionLabel(
  row: OfferedSubjectSemesterRegistrationOption,
) {
  return resolveSemesterRegistrationLabel(row);
}

export function buildOfferedSubjectFormDefaults(
  row: OfferedSubject,
): OfferedSubjectFormValues {
  return {
    semesterRegistration: resolveRelationId(row.semesterRegistration),
    academicInstructor: resolveRelationId(row.academicInstructor),
    academicDepartment: resolveRelationId(row.academicDepartment),
    subject: resolveRelationId(row.subject),
    instructor: resolveRelationId(row.instructor),
    section: String(row.section ?? ""),
    maxCapacity: String(row.maxCapacity ?? ""),
    days: Array.isArray(row.days) ? row.days : [],
    startTime: normalizeTimeValue(row.startTime),
    endTime: normalizeTimeValue(row.endTime),
  };
}

export function normalizeTimeValue(value: string | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}:\d{2}:\d{2}/.test(trimmed)) return trimmed.slice(0, 5);
  return trimmed;
}
