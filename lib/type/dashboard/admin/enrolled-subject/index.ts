import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { Subject } from "@/lib/type/dashboard/admin/subject";

export type EnrolledSubjectOffered = {
  _id?: string;
  section?: number;
  days?: string[];
  startTime?: string;
  endTime?: string;
};

export type EnrolledSubjectMarks = {
  classTest1?: number;
  midTerm?: number;
  classTest2?: number;
  finalTerm?: number;
};

export type EnrolledSubject = {
  _id: string;
  academicSemester?: AcademicSemester | string;
  semesterRegistration: SemesterRegistration | string;
  offeredSubject: EnrolledSubjectOffered | string;
  subject: Subject | string;
  instructor: Instructor | string;
  isEnrolled?: boolean;
  subjectMarks?: EnrolledSubjectMarks;
  grade?: string;
  gradePoints?: number;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};
