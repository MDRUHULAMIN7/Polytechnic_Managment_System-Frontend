import type {
  AcademicSemesterCode,
  AcademicSemesterMonth,
  AcademicSemesterName,
} from "@/lib/api/types";
import type { AcademicSemesterFormValues } from "@/lib/types/pages/academic.types";

export const ACADEMIC_SEMESTER_NAMES: AcademicSemesterName[] = [
  "First",
  "Second",
  "Third",
  "Fourth",
  "Fifth",
  "Sixth",
  "Seventh",
  "Eighth",
];

export const ACADEMIC_SEMESTER_MONTHS: AcademicSemesterMonth[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const ACADEMIC_SEMESTER_NAME_CODE: Record<
  AcademicSemesterName,
  AcademicSemesterCode
> = {
  First: "01",
  Second: "02",
  Third: "03",
  Fourth: "04",
  Fifth: "05",
  Sixth: "06",
  Seventh: "07",
  Eighth: "08",
};

export const ACADEMIC_SEMESTER_ROW_SIZES = [5, 10, 20] as const;

export const ACADEMIC_SEMESTER_EMPTY_FORM: AcademicSemesterFormValues = {
  name: "",
  year: "",
  startMonth: "",
  endMonth: "",
};

export function isAcademicSemesterName(
  value: string,
): value is AcademicSemesterName {
  return ACADEMIC_SEMESTER_NAMES.includes(value as AcademicSemesterName);
}

export function isAcademicSemesterMonth(
  value: string,
): value is AcademicSemesterMonth {
  return ACADEMIC_SEMESTER_MONTHS.includes(value as AcademicSemesterMonth);
}
