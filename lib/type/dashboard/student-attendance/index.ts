import type {
  AdminClassDetails,
  AttendanceRecord,
  AttendanceStatus,
} from "@/lib/type/dashboard/class-session";
import type { Subject } from "@/lib/type/dashboard/admin/subject";

export type AttendanceSubmissionRow = {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string | null;
};

export type AttendanceSubmissionInput = {
  classSessionId: string;
  attendance: AttendanceSubmissionRow[];
};

export type AttendanceUpdateInput = {
  status: AttendanceStatus;
  remarks?: string | null;
};

export type AttendanceSummaryRow = {
  subject: Subject | string;
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
  attendancePercentage: number;
  status: "GOOD" | "WARNING" | "CRITICAL";
};

export type AttendanceSubmissionResult = {
  classSessionId: string;
  status: string;
  totalMarked: number;
  presentCount: number;
  absentCount: number;
  leaveCount: number;
};

export type ClassAttendancePayload = AdminClassDetails;

export type StudentAttendanceRecord = AttendanceRecord;
