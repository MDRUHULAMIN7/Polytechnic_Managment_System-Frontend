import type { ReactNode } from "react";

export type AcademicInstructorFormValues = {
  name: string;
};

export type AcademicInstructorDialogMode = "create" | "update" | "details" | null;

export type AcademicDepartmentFormValues = {
  name: string;
  academicInstructor: string;
};

export type AcademicDepartmentDialogMode = "create" | "update" | "details" | null;

export type AcademicSemesterFormValues = {
  name: string;
  year: string;
  startMonth: string;
  endMonth: string;
};

export type AcademicSemesterDialogMode = "create" | "update" | "details" | null;

export type PageModalFrameProps = {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
};
