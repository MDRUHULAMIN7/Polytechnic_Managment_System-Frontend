import type { createAdmin } from "@/lib/api/admin";
import type { AdminProfile, ApiMeta, UserStatus } from "@/lib/api/types";
import type {
  AdminSortOrder,
  AdminTableState,
  CreateAdminFormValues,
  SearchParamsLike,
} from "@/lib/types/utils/admin.types";

export type {
  AdminSortOrder,
  AdminTableState,
  CreateAdminFormValues,
  SearchParamsLike,
} from "@/lib/types/utils/admin.types";
export type { AdminTableRow } from "@/lib/types/utils/admin.types";

export const DEFAULT_ADMIN_TABLE_STATE: AdminTableState = {
  searchTerm: "",
  sort: "name",
  page: 1,
  limit: 10,
};

export const ADMIN_DEFAULT_META: ApiMeta = {
  page: DEFAULT_ADMIN_TABLE_STATE.page,
  limit: DEFAULT_ADMIN_TABLE_STATE.limit,
  total: 0,
  totalPage: 1,
};

export const ADMIN_TABLE_PAGE_SIZES = [5, 10, 20] as const;

export const ADMIN_TABLE_FIELDS = [
  "_id",
  "id",
  "designation",
  "name",
  "email",
  "user",
  "profileImg",
] as const;

export const ADMIN_BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const ADMIN_GENDERS = ["male", "female", "other"] as const;

export const EMPTY_CREATE_ADMIN_FORM: CreateAdminFormValues = {
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
  profileImg: "",
};

type CreateAdminPayload = Parameters<typeof createAdmin>[1];

export function isAdminGender(
  value: string,
): value is (typeof ADMIN_GENDERS)[number] {
  return ADMIN_GENDERS.includes(value as (typeof ADMIN_GENDERS)[number]);
}

export function isAdminBloodGroup(
  value: string,
): value is (typeof ADMIN_BLOOD_GROUPS)[number] {
  return ADMIN_BLOOD_GROUPS.includes(
    value as (typeof ADMIN_BLOOD_GROUPS)[number],
  );
}

export function isUserStatus(value: string): value is UserStatus {
  return value === "active" || value === "blocked";
}

function toPositiveNumber(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

function parseSort(value: string | null): AdminSortOrder {
  return value === "-name" ? "-name" : "name";
}

export function parseAdminTableState(
  searchParams: SearchParamsLike,
): AdminTableState {
  return {
    searchTerm: searchParams.get("searchTerm") ?? "",
    sort: parseSort(searchParams.get("sort")),
    page: toPositiveNumber(
      searchParams.get("page"),
      DEFAULT_ADMIN_TABLE_STATE.page,
    ),
    limit: toPositiveNumber(
      searchParams.get("limit"),
      DEFAULT_ADMIN_TABLE_STATE.limit,
    ),
  };
}

export function toAdminRouteQuery(state: AdminTableState) {
  const query = new URLSearchParams();
  const searchTerm = state.searchTerm.trim();

  if (searchTerm) query.set("searchTerm", searchTerm);
  if (state.sort !== DEFAULT_ADMIN_TABLE_STATE.sort)
    query.set("sort", state.sort);
  if (state.page !== DEFAULT_ADMIN_TABLE_STATE.page)
    query.set("page", String(state.page));
  if (state.limit !== DEFAULT_ADMIN_TABLE_STATE.limit)
    query.set("limit", String(state.limit));

  return query;
}

export function toAdminApiQuery(state: AdminTableState) {
  const query = toAdminRouteQuery(state);
  query.set("page", String(state.page));
  query.set("limit", String(state.limit));
  query.set("fields", ADMIN_TABLE_FIELDS.join(","));
  return query;
}

export function isSameAdminTableState(
  left: AdminTableState,
  right: AdminTableState,
) {
  return (
    left.searchTerm === right.searchTerm &&
    left.sort === right.sort &&
    left.page === right.page &&
    left.limit === right.limit
  );
}



export function resolveAdminUserId(
  row: Pick<AdminProfile, "user"> | null | undefined,
) {
  if (!row?.user) return "";
  if (typeof row.user === "string") return row.user;
  return row.user._id;
}

export function resolveAdminUserStatus(
  row: Pick<AdminProfile, "user"> | null | undefined,
): UserStatus {
  if (!row?.user || typeof row.user === "string") return "active";
  if (row.user.status && isUserStatus(row.user.status)) return row.user.status;
  return "active";
}

export function resolveAdminUserRole(
  row: Pick<AdminProfile, "user"> | null | undefined,
) {
  if (!row?.user || typeof row.user === "string") return "-";
  return row.user.role ?? "-";
}

export function resolveAdminFullName(
  row: Pick<AdminProfile, "name"> | null | undefined,
) {
  const first = row?.name?.firstName?.trim() ?? "";
  const middle = row?.name?.middleName?.trim() ?? "";
  const last = row?.name?.lastName?.trim() ?? "";
  return [first, middle, last].filter(Boolean).join(" ") || "-";
}

export function resolveAdminProfileImage(
  row: Pick<AdminProfile, "profileImg"> | null | undefined,
) {
  const image = row?.profileImg?.trim();
  return image ? image : null;
}

export function buildCreateAdminPayload(
  values: CreateAdminFormValues,
): CreateAdminPayload {
  return {
    password: values.password.trim(),
    admin: {
      designation: values.designation.trim(),
      name: {
        firstName: values.firstName.trim(),
        middleName: values.middleName.trim(),
        lastName: values.lastName.trim(),
      },
      gender: values.gender as CreateAdminPayload["admin"]["gender"],
      dateOfBirth: values.dateOfBirth || undefined,
      email: values.email.trim(),
      contactNo: values.contactNo.trim(),
      emergencyContactNo: values.emergencyContactNo.trim(),
      bloogGroup:
        values.bloogGroup as CreateAdminPayload["admin"]["bloogGroup"],
      presentAddress: values.presentAddress.trim(),
      permanentAddress: values.permanentAddress.trim(),
      profileImg: values.profileImg.trim(),
    },
  };
}
