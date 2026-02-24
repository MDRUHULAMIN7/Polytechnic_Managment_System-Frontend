import type {
  AcademicDepartment,
  ApiMeta,
  InstructorProfile,
  UserStatus,
} from "@/lib/api/types";
import type { ServerListState } from "@/lib/list-query";
import { isUserStatus } from "@/lib/utils/admin/admin-utils";
import type { CreateInstructorFormValues } from "@/lib/types/utils/instructor.types";

export type { CreateInstructorFormValues } from "@/lib/types/utils/instructor.types";
export type {
  InstructorSort,
  InstructorTableRow,
} from "@/lib/types/utils/instructor.types";

export const INSTRUCTOR_TABLE_FIELDS = [
  "_id",
  "id",
  "name",
  "designation",
  "email",
  "user",
  "academicDepartment",
  "profileImg",
] as const;

export const INSTRUCTOR_TABLE_PAGE_SIZES = [5, 10, 20] as const;
export const INSTRUCTOR_SORT_OPTIONS = ["name", "-name"] as const;
export const INSTRUCTOR_DEFAULT_TABLE_STATE: ServerListState = {
  searchTerm: "",
  sort: "name",
  page: 1,
  limit: 10,
};
export const INSTRUCTOR_DEFAULT_META: ApiMeta = {
  page: INSTRUCTOR_DEFAULT_TABLE_STATE.page,
  limit: INSTRUCTOR_DEFAULT_TABLE_STATE.limit,
  total: 0,
  totalPage: 1,
};

export const INSTRUCTOR_GENDERS = ["male", "female", "other"] as const;
export const INSTRUCTOR_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const EMPTY_CREATE_INSTRUCTOR_FORM: CreateInstructorFormValues = {
  password: "",
  designation: "",
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",
  email: "",
  contactNo: "",
  emergencyContactNo: "",
  bloogGroup: "",
  presentAddress: "",
  permanentAddress: "",
  academicDepartment: "",
  profileFile: null,
};

export function isInstructorGender(
  value: string,
): value is (typeof INSTRUCTOR_GENDERS)[number] {
  return INSTRUCTOR_GENDERS.includes(
    value as (typeof INSTRUCTOR_GENDERS)[number],
  );
}

export function isInstructorBloodGroup(
  value: string,
): value is (typeof INSTRUCTOR_BLOOD_GROUPS)[number] {
  return INSTRUCTOR_BLOOD_GROUPS.includes(
    value as (typeof INSTRUCTOR_BLOOD_GROUPS)[number],
  );
}

export function resolveInstructorFullName(
  row:
    | Pick<InstructorProfile, "name">
    | { name?: { firstName?: string; middleName?: string; lastName?: string } }
    | null
    | undefined,
) {
  const first = row?.name?.firstName?.trim() ?? "";
  const middle = row?.name?.middleName?.trim() ?? "";
  const last = row?.name?.lastName?.trim() ?? "";
  return [first, middle, last].filter(Boolean).join(" ") || "-";
}

export function resolveDepartmentName(
  value: string | AcademicDepartment | null | undefined,
) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || "-";
}

export function resolveUserId(
  row: Pick<InstructorProfile, "user"> | null | undefined,
) {
  if (!row?.user) return "";
  if (typeof row.user === "string") return row.user;
  return row.user._id;
}

export function resolveUserStatus(
  row: Pick<InstructorProfile, "user"> | null | undefined,
  override?: UserStatus,
) {
  if (override) return override;
  if (!row?.user || typeof row.user === "string") return null;
  if (row.user.status && isUserStatus(row.user.status)) return row.user.status;
  return null;
}

export function resolveUserRole(
  row: Pick<InstructorProfile, "user"> | null | undefined,
) {
  if (!row?.user || typeof row.user === "string") return "-";
  return row.user.role ?? "-";
}

export function resolveProfileImage(
  row: Pick<InstructorProfile, "profileImg"> | null | undefined,
) {
  const image = row?.profileImg?.trim();
  return image ? image : null;
}

