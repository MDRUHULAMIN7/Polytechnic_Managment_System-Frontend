import type {
  AcademicDepartment,
  Curriculum,
  SemesterRegistration,
  SubjectProfile,
} from "@/lib/api/types";

export type CurriculumFormValues = {
  academicDepartment: string;
  semisterRegistration: string;
  regulation: string;
  session: string;
  subjects: string[];
};

export type CurriculumDialogMode = "create" | "update" | "details" | null;

export type CurriculumSort =
  | "-createdAt"
  | "createdAt"
  | "session"
  | "-session";

export type CurriculumAcademicDepartmentOption = Pick<
  AcademicDepartment,
  "_id" | "name"
>;

export type CurriculumSemesterRegistrationOption = Pick<
  SemesterRegistration,
  "_id" | "academicSemester" | "shift" | "status" | "startDate" | "endDate"
>;

export type CurriculumSubjectOption = Pick<
  SubjectProfile,
  "_id" | "title" | "prefix" | "code" | "credits" | "regulation"
>;

export type CurriculumTableRow = Pick<
  Curriculum,
  | "_id"
  | "academicDepartment"
  | "academicSemester"
  | "semisterRegistration"
  | "regulation"
  | "session"
  | "subjects"
  | "totalCredit"
  | "createdAt"
  | "updatedAt"
>;
