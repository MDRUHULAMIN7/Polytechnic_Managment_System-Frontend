import type { AcademicDepartment } from "@/lib/type/dashboard/admin/academic-department";
import type { Instructor } from "@/lib/type/dashboard/admin/instructor";
import type { SemesterRegistration } from "@/lib/type/dashboard/admin/semester-registration";
import type { Subject } from "@/lib/type/dashboard/admin/subject";

export type ClassSessionStatus =
  | "SCHEDULED"
  | "ONGOING"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";
export type AttendanceDisplayStatus = AttendanceStatus | "NOT_MARKED";

export type ClassSessionOfferedSubject = {
  _id?: string;
  section?: number;
  days?: string[];
  startTime?: string;
  endTime?: string;
};

export type ClassSessionAttendanceInfo = {
  _id?: string;
  status: AttendanceStatus;
  remarks?: string | null;
  markedAt?: string | null;
};

export type ClassSession = {
  _id: string;
  subject: Subject | string;
  instructor: Instructor | string;
  academicDepartment?: AcademicDepartment | string;
  semesterRegistration?: SemesterRegistration | string;
  offeredSubject?: ClassSessionOfferedSubject | string;
  date: string;
  day: string;
  sessionNumber: number;
  startTime: string;
  endTime: string;
  topic?: string;
  remarks?: string;
  status: ClassSessionStatus;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  startedAt?: string;
  completedAt?: string;
  myAttendance?: ClassSessionAttendanceInfo | null;
};

export type ClassSessionStudentRow = {
  studentId: string;
  studentCode: string;
  name?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  email?: string;
  contactNo?: string;
  attendanceStatus: AttendanceDisplayStatus;
  remarks?: string | null;
  markedAt?: string | null;
};

export type AttendanceRecord = {
  _id: string;
  status: AttendanceDisplayStatus;
  remarks?: string | null;
  markedAt?: string;
  student:
    | string
    | {
        _id: string;
        id?: string;
        name?: {
          firstName?: string;
          middleName?: string;
          lastName?: string;
        };
        email?: string;
        contactNo?: string;
      };
};

export type ClassSessionStatistics = {
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  notMarkedCount: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type ClassSessionListPayload = {
  meta: PaginationMeta;
  result: ClassSession[];
};

export type InstructorClassDetails = {
  classSession: ClassSession;
  students: ClassSessionStudentRow[];
};

export type StudentClassDetails = {
  classSession: ClassSession;
  myAttendance: ClassSessionAttendanceInfo | null;
  canViewDetails: boolean;
};

export type AdminClassDetails = {
  classSession: ClassSession;
  attendance: AttendanceRecord[];
  statistics: ClassSessionStatistics;
};

export type DashboardSummary = {
  totalToday: number;
  scheduled: number;
  ongoing: number;
  completed: number;
  cancelled?: number;
  sessions: ClassSession[];
};

export type ClassSessionListParams = {
  page?: number;
  limit?: number;
  status?: string;
  searchTerm?: string;
  startDate?: string;
  endDate?: string;
  offeredSubject?: string;
  subject?: string;
  instructor?: string;
  academicDepartment?: string;
  semesterRegistration?: string;
};

export type SyncClassSessionsInput = {
  offeredSubjectId?: string;
  replaceScheduled?: boolean;
};

export type StartClassSessionInput = {
  topic?: string;
  remarks?: string;
};

export type SyncClassSessionsResult = {
  totalOfferedSubjects: number;
  result: Array<{
    offeredSubjectId: string;
    generatedCount: number;
    skippedCount: number;
    totalStudents: number;
  }>;
};

export type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
};
