import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { AcademicInstructor } from "@/lib/type/dashboard/admin/academic-instructor";
import type { AcademicSemester } from "@/lib/type/dashboard/admin/academic-semester";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { Room } from "@/lib/type/dashboard/admin/room";
import type {
  AssessmentComponent,
  Subject,
  SubjectMarkingScheme,
} from "@/lib/type/dashboard/admin/subject";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";

export type OfferedSubjectDay =
  | "Sat"
  | "Sun"
  | "Mon"
  | "Tue"
  | "Wed"
  | "Thu"
  | "Fri";

export type OfferedSubjectClassType = "theory" | "practical" | "tutorial";

export type OfferedSubjectMarkingStatus =
  | "NOT_STARTED"
  | "ONGOING"
  | "PARTIALLY_RELEASED"
  | "FINAL_PUBLISHED";

export type OfferedSubject = {
  _id: string;
  semesterRegistration: SemesterRegistration | string;
  academicSemester: AcademicSemester | string;
  academicInstructor: AcademicInstructor | string;
  academicDepartment: AcademicDepartment | string;
  subject: Subject | string;
  instructor: Instructor | string;
  maxCapacity: number;
  section: number;
  days: OfferedSubjectDay[];
  startTime: string;
  endTime: string;
  scheduleBlocks?: OfferedSubjectScheduleBlock[];
  markingSchemeSnapshot?: SubjectMarkingScheme;
  assessmentComponentsSnapshot?: AssessmentComponent[];
  releasedComponentCodes?: string[];
  finalResultPublishedAt?: string | null;
  markingStatus?: OfferedSubjectMarkingStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type OfferedSubjectScheduleBlock = {
  classType: OfferedSubjectClassType;
  day: OfferedSubjectDay;
  room: Room | string;
  startPeriod: number;
  periodCount: number;
  periodNumbers?: number[];
  startTimeSnapshot?: string;
  endTimeSnapshot?: string;
};

export type OfferedSubjectSortOption = "-createdAt" | "createdAt";
export type OfferedSubjectScopeOption = "all" | "my";

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type OfferedSubjectListPayload = {
  meta: PaginationMeta;
  result: OfferedSubject[];
};

export type OfferedSubjectListParams = {
  searchTerm?: string;
  page?: number;
  limit?: number;
  sort?: OfferedSubjectSortOption;
  scope?: OfferedSubjectScopeOption;
  semesterRegistration?: string;
  academicDepartment?: string;
  academicInstructor?: string;
  subject?: string;
  instructor?: string;
  fields?: string;
};

export type OfferedSubjectMyListParams = {
  page?: number;
  limit?: number;
};

export type OfferedSubjectInput = {
  semesterRegistration: string;
  academicInstructor: string;
  academicDepartment: string;
  subject: string;
  instructor: string;
  section: number;
  maxCapacity: number;
  scheduleBlocks: OfferedSubjectScheduleBlockInput[];
};

export type OfferedSubjectUpdateInput = {
  instructor: string;
  maxCapacity: number;
  scheduleBlocks: OfferedSubjectScheduleBlockInput[];
};

export type OfferedSubjectScheduleBlockInput = {
  classType: OfferedSubjectClassType;
  day: OfferedSubjectDay;
  room: string;
  startPeriod: number;
  periodCount: number;
};

export type ApiResponse<T> = {
  [x: string]: unknown;
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
