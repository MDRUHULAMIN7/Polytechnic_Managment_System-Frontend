import type {
  AcademicDepartment,
  AcademicSemester,
  ApiMeta,
  Curriculum,
  SemesterRegistration,
  SubjectProfile,
} from "@/lib/api/types";
import type { ServerListState } from "@/lib/list-query";
import type {
  CurriculumFormValues,
  CurriculumSort,
  CurriculumSubjectOption,
} from "@/lib/types/pages/curriculum/curriculum.types";
import { formatDate } from "@/lib/utils/utils";

export const CURRICULUM_SORT_OPTIONS: readonly CurriculumSort[] = [
  "-createdAt",
  "createdAt",
  "session",
  "-session",
];

export const CURRICULUM_ROWS_PER_PAGE = [5, 10, 20] as const;

export const CURRICULUM_TABLE_FIELDS = [
  "_id",
  "academicDepartment",
  "academicSemester",
  "semisterRegistration",
  "regulation",
  "session",
  "subjects",
  "totalCredit",
  "createdAt",
  "updatedAt",
] as const;

export const CURRICULUM_DEFAULT_TABLE_STATE: ServerListState = {
  searchTerm: "",
  sort: "-createdAt",
  page: 1,
  limit: 10,
};

export const CURRICULUM_DEFAULT_META: ApiMeta = {
  page: CURRICULUM_DEFAULT_TABLE_STATE.page,
  limit: CURRICULUM_DEFAULT_TABLE_STATE.limit,
  total: 0,
  totalPage: 1,
};

export const EMPTY_CURRICULUM_FORM: CurriculumFormValues = {
  academicDepartment: "",
  semisterRegistration: "",
  regulation: "",
  session: "",
  subjects: [],
};

export function parseRegulation(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return Math.floor(parsed);
}

export function isValidSession(value: string) {
  const normalized = value.trim();
  if (!/^\d{4}-\d{4}$/.test(normalized)) return false;
  const [start, end] = normalized.split("-").map(Number);
  return end === start + 1;
}

export function resolveAcademicDepartmentLabel(
  department: string | AcademicDepartment | null | undefined,
) {
  if (!department) return "-";
  if (typeof department === "string") return department;
  return department.name || "-";
}

export function resolveAcademicSemesterLabel(
  semester: string | AcademicSemester | null | undefined,
) {
  if (!semester) return "-";
  if (typeof semester === "string") return semester;
  return `${semester.name} (${semester.code}) ${semester.year}`;
}

export function resolveSemesterRegistrationId(
  value: string | SemesterRegistration | null | undefined,
) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id;
}

export function resolveSemesterRegistrationAcademicSemesterId(
  value: string | SemesterRegistration | null | undefined,
) {
  if (!value || typeof value === "string") return "";
  const semester = value.academicSemester;
  if (!semester || typeof semester === "string") return "";
  return semester._id;
}

export function resolveSemesterRegistrationLabel(
  value:
    | string
    | Pick<
        SemesterRegistration,
        "academicSemester" | "shift" | "status" | "startDate" | "endDate"
      >
    | null
    | undefined,
) {
  if (!value) return "-";
  if (typeof value === "string") return "-";

  const hasDateRange = Boolean(value.startDate || value.endDate);
  const dateRange = hasDateRange
    ? `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`
    : resolveAcademicSemesterLabel(value.academicSemester);

  return `${dateRange} | ${value.shift} | ${value.status}`;
}

export function resolveSubjectLabel(
  subject: string | SubjectProfile | null | undefined,
) {
  if (!subject) return "-";
  if (typeof subject === "string") return "-";
  return subject.title || "-";
}

export function resolveSubjectOptionLabel(subject: CurriculumSubjectOption) {
  return `${subject.prefix}${subject.code} - ${subject.title} (${subject.credits} cr)`;
}

export function resolveSubjectIds(
  subjects: Curriculum["subjects"] | null | undefined,
) {
  if (!subjects || subjects.length === 0) return [];
  return subjects
    .map((subject) => (typeof subject === "string" ? subject : subject._id))
    .filter((id): id is string => Boolean(id));
}

export function calculateSelectedSubjectsCredit(
  subjectIds: string[],
  subjectOptions: CurriculumSubjectOption[],
) {
  if (!subjectIds.length || !subjectOptions.length) return 0;
  const subjectMap = new Map(subjectOptions.map((subject) => [subject._id, subject]));
  return subjectIds.reduce((sum, id) => sum + (subjectMap.get(id)?.credits ?? 0), 0);
}

export function buildCurriculumFormDefaults(
  row: Curriculum,
): CurriculumFormValues {
  return {
    academicDepartment:
      typeof row.academicDepartment === "string"
        ? row.academicDepartment
        : row.academicDepartment?._id ?? "",
    semisterRegistration: resolveSemesterRegistrationId(row.semisterRegistration),
    regulation: String(row.regulation ?? ""),
    session: row.session ?? "",
    subjects: resolveSubjectIds(row.subjects),
  };
}
