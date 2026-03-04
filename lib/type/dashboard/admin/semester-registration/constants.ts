import type {
  SemesterRegistrationShift,
  SemesterRegistrationStatus,
} from "./index";

export const SEMESTER_REGISTRATION_STATUSES: SemesterRegistrationStatus[] = [
  "UPCOMING",
  "ONGOING",
  "ENDED",
];

export const SEMESTER_REGISTRATION_SHIFTS: SemesterRegistrationShift[] = [
  "MORNING",
  "DAY",
];
