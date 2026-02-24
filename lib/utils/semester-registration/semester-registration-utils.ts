import type {
  AcademicSemester,
  ApiMeta,
  SemesterRegistration,
  SemesterRegistrationShift,
  SemesterRegistrationStatus,
} from "@/lib/api/types";
import type { ServerListState } from "@/lib/list-query";
import type {
  SemesterRegistrationFormValues,
  SemesterRegistrationSort,
} from "@/lib/types/pages/semester-registration/semester-registration.types";

export const SEMESTER_REGISTRATION_STATUSES: readonly SemesterRegistrationStatus[] =
  ["UPCOMING", "ONGOING", "ENDED"];
export const SEMESTER_REGISTRATION_SHIFTS: readonly SemesterRegistrationShift[] =
  ["MORNING", "DAY"];

export const SEMESTER_REGISTRATION_SORT_OPTIONS: readonly SemesterRegistrationSort[] =
  ["-createdAt", "createdAt", "-startDate", "startDate"];
export const SEMESTER_REGISTRATION_ROWS_PER_PAGE = [5, 10, 20] as const;
export const SEMESTER_REGISTRATION_TABLE_FIELDS = [
  "_id",
  "academicSemester",
  "status",
  "shift",
  "startDate",
  "endDate",
  "totalCredit",
  "createdAt",
  "updatedAt",
] as const;

export const SEMESTER_REGISTRATION_DEFAULT_TABLE_STATE: ServerListState = {
  searchTerm: "",
  sort: "-createdAt",
  page: 1,
  limit: 10,
};

export const SEMESTER_REGISTRATION_DEFAULT_META: ApiMeta = {
  page: SEMESTER_REGISTRATION_DEFAULT_TABLE_STATE.page,
  limit: SEMESTER_REGISTRATION_DEFAULT_TABLE_STATE.limit,
  total: 0,
  totalPage: 1,
};

export const EMPTY_SEMESTER_REGISTRATION_FORM: SemesterRegistrationFormValues = {
  academicSemester: "",
  status: "",
  shift: "",
  startDate: "",
  endDate: "",
  totalCredit: "",
};

export function isSemesterRegistrationStatus(
  value: string,
): value is SemesterRegistrationStatus {
  return SEMESTER_REGISTRATION_STATUSES.includes(
    value as SemesterRegistrationStatus,
  );
}

export function isSemesterRegistrationShift(
  value: string,
): value is SemesterRegistrationShift {
  return SEMESTER_REGISTRATION_SHIFTS.includes(value as SemesterRegistrationShift);
}

export function parseTotalCredit(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function toDateTimeInputValue(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

export function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

export function resolveSemesterLabel(
  academicSemester: SemesterRegistration["academicSemester"],
) {
  if (!academicSemester) return "-";
  if (typeof academicSemester === "string") return academicSemester;
  return `${academicSemester.name} (${academicSemester.code}) ${academicSemester.year}`;
}

export function resolveSemesterId(
  academicSemester: SemesterRegistration["academicSemester"] | null | undefined,
) {
  if (!academicSemester) return "";
  if (typeof academicSemester === "string") return academicSemester;
  return academicSemester._id;
}

export function buildSemesterRegistrationFormDefaults(
  row: SemesterRegistration,
): SemesterRegistrationFormValues {
  return {
    academicSemester: resolveSemesterId(row.academicSemester),
    status: row.status,
    shift: row.shift,
    startDate: toDateTimeInputValue(row.startDate),
    endDate: toDateTimeInputValue(row.endDate),
    totalCredit: String(row.totalCredit ?? ""),
  };
}

export function resolveSemesterOptionLabel(row: AcademicSemester) {
  return `${row.name} (${row.code}) ${row.year}`;
}
