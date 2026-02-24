import type {
  AcademicDepartment,
  AcademicSemester,
  ApiMeta,
  StudentProfile,
  UserStatus,
} from "@/lib/api/types";
import type { ServerListState } from "@/lib/list-query";
import { isUserStatus } from "@/lib/utils/admin/admin-utils";
import type { CreateStudentFormValues } from "@/lib/types/utils/student.types";

export type { CreateStudentFormValues } from "@/lib/types/utils/student.types";
export type {
  StudentSort,
  StudentTableRow,
} from "@/lib/types/utils/student.types";

export const STUDENT_TABLE_FIELDS = [
  "_id",
  "id",
  "name",
  "email",
  "user",
  "admissionSemester",
  "academicDepartment",
  "profileImg",
] as const;

export const STUDENT_TABLE_PAGE_SIZES = [5, 10, 20] as const;
export const STUDENT_SORT_OPTIONS = ["name", "-name"] as const;
export const STUDENT_DEFAULT_TABLE_STATE: ServerListState = {
  searchTerm: "",
  sort: "name",
  page: 1,
  limit: 10,
};
export const STUDENT_DEFAULT_META: ApiMeta = {
  page: STUDENT_DEFAULT_TABLE_STATE.page,
  limit: STUDENT_DEFAULT_TABLE_STATE.limit,
  total: 0,
  totalPage: 1,
};

export const STUDENT_GENDERS = ["male", "female", "others"] as const;
export const STUDENT_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const EMPTY_CREATE_STUDENT_FORM: CreateStudentFormValues = {
  password: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  email: "",
  contactNo: "",
  emergencyContactNo: "",
  bloodGroup: "",
  presentAddress: "",
  permanentAddress: "",
  academicDepartment: "",
  admissionSemester: "",
  fatherName: "",
  fatherOccupation: "",
  fatherContactNo: "",
  motherName: "",
  motherOccupation: "",
  motherContactNo: "",
  localGuardianName: "",
  localGuardianOccupation: "",
  localGuardianContactNo: "",
  localGuardianAddress: "",
  profileFile: null,
};

export function isStudentGender(
  value: string,
): value is (typeof STUDENT_GENDERS)[number] {
  return STUDENT_GENDERS.includes(value as (typeof STUDENT_GENDERS)[number]);
}

export function isStudentBloodGroup(
  value: string,
): value is (typeof STUDENT_BLOOD_GROUPS)[number] {
  return STUDENT_BLOOD_GROUPS.includes(
    value as (typeof STUDENT_BLOOD_GROUPS)[number],
  );
}

export function resolveStudentFullName(
  row:
    | Pick<StudentProfile, "name">
    | { name?: { firstName?: string; middleName?: string; lastName?: string } }
    | null
    | undefined,
) {
  const first = row?.name?.firstName?.trim() ?? "";
  const middle = row?.name?.middleName?.trim() ?? "";
  const last = row?.name?.lastName?.trim() ?? "";
  return [first, middle, last].filter(Boolean).join(" ") || "-";
}

export function resolveSemesterLabel(
  value: string | AcademicSemester | null | undefined,
) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  const name = value.name ?? "";
  const year = value.year ?? "";
  return [name, year].filter(Boolean).join(" ") || value._id || "-";
}

export function resolveDepartmentName(
  value: string | AcademicDepartment | null | undefined,
) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || "-";
}

export function resolveUserId(
  row: Pick<StudentProfile, "user"> | null | undefined,
) {
  if (!row?.user) return "";
  if (typeof row.user === "string") return row.user;
  return row.user._id;
}

export function resolveUserStatus(
  row: Pick<StudentProfile, "user"> | null | undefined,
  override?: UserStatus,
) {
  if (override) return override;
  if (!row?.user || typeof row.user === "string") return null;
  if (row.user.status && isUserStatus(row.user.status)) return row.user.status;
  return null;
}

export function resolveUserRole(
  row: Pick<StudentProfile, "user"> | null | undefined,
) {
  if (!row?.user || typeof row.user === "string") return "-";
  return row.user.role ?? "-";
}

export function resolveProfileImage(
  row: Pick<StudentProfile, "profileImg"> | null | undefined,
) {
  const image = row?.profileImg?.trim();
  return image ? image : null;
}
