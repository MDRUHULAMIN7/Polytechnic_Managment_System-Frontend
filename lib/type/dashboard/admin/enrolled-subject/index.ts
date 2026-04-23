import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type {
  AssessmentBucket,
  AssessmentComponentType,
  Subject,
  SubjectMarkingScheme,
} from "@/lib/type/dashboard/admin/subject";
import type { OfferedSubject } from "@/lib/type/dashboard/admin/offered-subject";

export type EnrolledSubjectMarkEntry = {
  componentCode: string;
  componentTitle: string;
  bucket: AssessmentBucket;
  componentType: AssessmentComponentType;
  fullMarks: number;
  order: number;
  isRequired: boolean;
  obtainedMarks: number | null;
  isReleased: boolean;
  releasedAt?: string | null;
  remarks?: string;
  lastUpdatedAt?: string | null;
  lastUpdatedBy?: string | null;
};

export type EnrolledSubjectMarkSummary = {
  theoryContinuous: number;
  theoryFinal: number;
  practicalContinuous: number;
  practicalFinal: number;
  releasedTheoryContinuous: number;
  releasedTheoryFinal: number;
  releasedPracticalContinuous: number;
  releasedPracticalFinal: number;
  total: number;
  releasedTotal: number;
  totalMarks: number;
  percentage: number;
  releasedPercentage: number;
  releasedMarks: number;
};

export type EnrolledSubjectResultStatus =
  | "IN_PROGRESS"
  | "PARTIAL_RELEASED"
  | "FINAL_READY"
  | "FINAL_PUBLISHED";

export type EnrolledSubject = {
  _id: string;
  academicSemester?: AcademicSemester | string;
  semesterRegistration: SemesterRegistration | string;
  offeredSubject: Pick<
    OfferedSubject,
    | "_id"
    | "section"
    | "days"
    | "startTime"
    | "endTime"
    | "releasedComponentCodes"
    | "finalResultPublishedAt"
    | "markingStatus"
  > | string;
  subject: Subject | string;
  instructor: Instructor | string;
  isEnrolled?: boolean;
  markingSchemeSnapshot?: SubjectMarkingScheme;
  markEntries?: EnrolledSubjectMarkEntry[];
  markSummary?: EnrolledSubjectMarkSummary;
  resultStatus?: EnrolledSubjectResultStatus;
  grade?: string;
  gradePoints?: number;
  finalResultPublishedAt?: string | null;
  isCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type OfferedSubjectMarkSheetStudent = {
  _id: string;
  student:
    | {
        _id: string;
        id?: string;
        name?: string;
      }
    | string;
  markEntries: EnrolledSubjectMarkEntry[];
  markSummary: EnrolledSubjectMarkSummary;
  grade: string;
  gradePoints: number;
  resultStatus: EnrolledSubjectResultStatus;
  finalResultPublishedAt?: string | null;
};

export type OfferedSubjectMarkSheet = {
  offeredSubject: OfferedSubject;
  enrolledSubjects: OfferedSubjectMarkSheetStudent[];
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};
