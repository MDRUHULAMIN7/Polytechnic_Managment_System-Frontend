import type {
  AcademicDepartment,
  AcademicInstructor,
  OfferedSubjectDay,
  SemesterRegistration,
  SubjectProfile,
  InstructorProfile,
} from "@/lib/types/api";

export type OfferedSubjectFormValues = {
  semesterRegistration: string;
  academicInstructor: string;
  academicDepartment: string;
  subject: string;
  instructor: string;
  section: string;
  maxCapacity: string;
  days: string[];
  startTime: string;
  endTime: string;
};

export type OfferedSubjectDialogMode = "create" | "update" | "details" | null;

export type OfferedSubjectSort =
  | "-createdAt"
  | "createdAt"
  | "-section"
  | "section";

export type OfferedSubjectSubjectOption = Pick<
  SubjectProfile,
  "_id" | "title" | "prefix" | "code"
>;
export type OfferedSubjectInstructorOption = Pick<
  InstructorProfile,
  "_id" | "id" | "name" | "designation"
>;
export type OfferedSubjectAcademicDepartmentOption = Pick<
  AcademicDepartment,
  "_id" | "name"
>;
export type OfferedSubjectAcademicInstructorOption = Pick<
  AcademicInstructor,
  "_id" | "name"
>;
export type OfferedSubjectSemesterRegistrationOption = Pick<
  SemesterRegistration,
  "_id" | "academicSemester" | "shift" | "status" | "startDate" | "endDate"
>;

export type OfferedSubjectCreatePayload = {
  semesterRegistration: string;
  academicInstructor: string;
  academicDepartment: string;
  subject: string;
  instructor: string;
  section: number;
  maxCapacity: number;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
};

export type OfferedSubjectUpdatePayload = {
  instructor: string;
  maxCapacity: number;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
};
