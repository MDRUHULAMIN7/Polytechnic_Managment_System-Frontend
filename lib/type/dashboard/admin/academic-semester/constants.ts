import type {
  AcademicSemesterCode,
  AcademicSemesterMonth,
  AcademicSemesterName,
} from "./index";

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

export const ACADEMIC_SEMESTER_CODES: AcademicSemesterCode[] = [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
];

export const ACADEMIC_SEMESTER_NAME_CODE_MAP: Record<
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
