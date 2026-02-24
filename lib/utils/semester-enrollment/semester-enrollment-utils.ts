import type {
  ApiMeta,
  SemesterEnrollment,
  SemesterEnrollmentStatus,
} from "@/lib/api/types";
import type { ServerListState } from "@/lib/list-query";
import type { SemesterEnrollmentSort } from "@/lib/types/pages/semester-enrollment/semester-enrollment.types";
import { formatDate } from "@/lib/utils/utils";

export const SEMESTER_ENROLLMENT_STATUSES: readonly SemesterEnrollmentStatus[] =
  ["PENDING", "APPROVED", "REJECTED", "COMPLETED"];

export const SEMESTER_ENROLLMENT_SORT_OPTIONS: readonly SemesterEnrollmentSort[] =
  ["-createdAt", "createdAt", "-fees", "fees"];
export const SEMESTER_ENROLLMENT_ROWS_PER_PAGE = [5, 10, 20] as const;

export const SEMESTER_ENROLLMENT_TABLE_FIELDS = [
  "_id",
  "student",
  "curriculum",
  "semesterRegistration",
  "academicSemester",
  "academicDepartment",
  "status",
  "fees",
  "isPaid",
  "createdAt",
  "updatedAt",
] as const;

export const SEMESTER_ENROLLMENT_DEFAULT_TABLE_STATE: ServerListState = {
  searchTerm: "",
  sort: "-createdAt",
  page: 1,
  limit: 10,
};

export const SEMESTER_ENROLLMENT_DEFAULT_META: ApiMeta = {
  page: SEMESTER_ENROLLMENT_DEFAULT_TABLE_STATE.page,
  limit: SEMESTER_ENROLLMENT_DEFAULT_TABLE_STATE.limit,
  total: 0,
  totalPage: 1,
};

function resolveNameParts(name: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}) {
  const first = name.firstName?.trim() ?? "";
  const middle = name.middleName?.trim() ?? "";
  const last = name.lastName?.trim() ?? "";
  return [first, middle, last].filter(Boolean).join(" ");
}

export function resolveStudentLabel(value: SemesterEnrollment["student"]) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  const fullName = value.name ? resolveNameParts(value.name) : "";
  if (fullName && value.id) return `${fullName} (${value.id})`;
  return fullName || value.id || value._id || "-";
}

export function resolveDepartmentLabel(
  value: SemesterEnrollment["academicDepartment"],
) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value._id || "-";
}

export function resolveAcademicSemesterLabel(
  value: SemesterEnrollment["academicSemester"],
) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  const pieces = [value.name, value.year].filter(Boolean);
  return pieces.join(" ") || value._id || "-";
}

export function resolveSemesterRegistrationDateRange(
  value: SemesterEnrollment["semesterRegistration"],
) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  const start = formatDate(value.startDate);
  const end = formatDate(value.endDate);
  return `${start} - ${end}`;
}

export function resolveSemesterRegistrationMeta(
  value: SemesterEnrollment["semesterRegistration"],
) {
  if (!value || typeof value !== "object") return "-";
  const pieces = [value.shift, value.status].filter(Boolean);
  return pieces.join(" | ") || "-";
}

export function resolveCurriculumLabel(value: SemesterEnrollment["curriculum"]) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  const pieces = [value.session, value.regulation ? `Reg ${value.regulation}` : ""].filter(
    Boolean,
  );
  return pieces.join(" | ") || value._id || "-";
}

export function resolvePaidLabel(value: boolean | undefined) {
  return value ? "Paid" : "Unpaid";
}

export function resolveEnrollmentStatusClass(status: SemesterEnrollmentStatus) {
  if (status === "APPROVED") {
    return "border-emerald-600/35 bg-emerald-500/10 text-emerald-500";
  }
  if (status === "REJECTED") {
    return "border-rose-600/35 bg-rose-500/10 text-rose-500";
  }
  if (status === "COMPLETED") {
    return "border-sky-600/35 bg-sky-500/10 text-sky-500";
  }
  return "border-amber-600/35 bg-amber-500/10 text-amber-500";
}

