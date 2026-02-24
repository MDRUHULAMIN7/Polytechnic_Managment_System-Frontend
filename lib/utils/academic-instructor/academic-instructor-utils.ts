import type { TableQueryState } from "@/lib/utils/table/table-utils";

export type AcademicInstructorSort = "name" | "-name";

export const ACADEMIC_INSTRUCTOR_DEFAULT_TABLE_STATE: TableQueryState = {
  searchTerm: "",
  sort: "name",
  startsWith: "all",
  page: 1,
  limit: 10,
};

export const ACADEMIC_INSTRUCTOR_ROWS_PER_PAGE = [5, 10, 20] as const;

export const ACADEMIC_INSTRUCTOR_SORT_OPTIONS = ["name", "-name"] as const;
