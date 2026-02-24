import type { AcademicDepartment } from "@/lib/api/types";
import type { TableQueryState } from "@/lib/utils/table/table-utils";

export type AcademicDepartmentSort = "name" | "-name";

export const ACADEMIC_DEPARTMENT_DEFAULT_TABLE_STATE: TableQueryState = {
  searchTerm: "",
  sort: "name",
  startsWith: "all",
  page: 1,
  limit: 10,
};

export const ACADEMIC_DEPARTMENT_ROWS_PER_PAGE = [5, 10, 20] as const;

export const ACADEMIC_DEPARTMENT_SORT_OPTIONS = ["name", "-name"] as const;

export function resolveAcademicDepartmentInstructorId(
  row: AcademicDepartment | null | undefined,
) {
  if (!row?.academicInstructor) return "";
  if (typeof row.academicInstructor === "string") return row.academicInstructor;
  return row.academicInstructor._id;
}

export function resolveAcademicDepartmentInstructorName(
  row: AcademicDepartment | null | undefined,
) {
  if (!row?.academicInstructor) return "-";
  if (typeof row.academicInstructor === "string") return row.academicInstructor;
  return row.academicInstructor.name;
}
