export type SemesterRegistrationFormValues = {
  academicSemester: string;
  status: string;
  shift: string;
  startDate: string;
  endDate: string;
  totalCredit: string;
};

export type SemesterRegistrationDialogMode =
  | "create"
  | "update"
  | "details"
  | null;

export type SemesterRegistrationSort =
  | "-createdAt"
  | "createdAt"
  | "-startDate"
  | "startDate";
