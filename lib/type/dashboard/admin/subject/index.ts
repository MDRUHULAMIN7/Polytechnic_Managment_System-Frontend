import type { Instructor } from "@/lib/type/dashboard/admin/instructor";

export type SubjectType =
  | "THEORY"
  | "THEORY_PRACTICAL"
  | "PRACTICAL_ONLY"
  | "PROJECT"
  | "INDUSTRIAL_ATTACHMENT";

export type AssessmentBucket =
  | "THEORY_CONTINUOUS"
  | "THEORY_FINAL"
  | "PRACTICAL_CONTINUOUS"
  | "PRACTICAL_FINAL";

export type AssessmentComponentType =
  | "class_test"
  | "attendance"
  | "assignment"
  | "presentation"
  | "teacher_assessment"
  | "written_exam"
  | "lab_performance"
  | "lab_report"
  | "viva"
  | "practical_exam"
  | "project_review"
  | "industry_evaluation";

export type SubjectMarkingScheme = {
  theoryContinuous: number;
  theoryFinal: number;
  practicalContinuous: number;
  practicalFinal: number;
  totalMarks: number;
};

export type AssessmentComponent = {
  code: string;
  title: string;
  bucket: AssessmentBucket;
  componentType: AssessmentComponentType;
  fullMarks: number;
  order: number;
  isRequired: boolean;
};

export type SubjectPreRequisite = {
  subject: Subject | string;
  isDeleted?: boolean;
};

export type Subject = {
  _id: string;
  title: string;
  prefix: string;
  code: number;
  credits: number;
  regulation: number;
  subjectType: SubjectType;
  markingScheme: SubjectMarkingScheme;
  assessmentComponents: AssessmentComponent[];
  preRequisiteSubjects?: SubjectPreRequisite[];
  isDeleted?: boolean;
};

export type SubjectSortOption = "title" | "-title" | "code" | "-code";
export type SubjectScopeOption = "all" | "my";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type SubjectListPayload = {
  meta: PaginationMeta;
  result: Subject[];
};

export type SubjectListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: SubjectSortOption;
  scope?: SubjectScopeOption;
  fields?: string;
};

export type SubjectInput = {
  title: string;
  prefix: string;
  code: number;
  credits: number;
  regulation: number;
  subjectType: SubjectType;
  markingScheme: SubjectMarkingScheme;
  assessmentComponents: Array<{
    code?: string;
    title: string;
    bucket: AssessmentBucket;
    componentType: AssessmentComponentType;
    fullMarks: number;
    order?: number;
    isRequired?: boolean;
  }>;
  preRequisiteSubjects?: {
    subject: string;
    isDeleted?: boolean;
  }[];
};

export type SubjectInstructor = {
  _id?: string;
  subject?: Subject | string;
  instructors: Instructor[];
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errorSources?: Array<{
    path?: string | number;
    message?: string;
  }>;
};
