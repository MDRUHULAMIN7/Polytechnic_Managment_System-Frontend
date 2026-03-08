import {
  API_BASE_URL,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";
import { getServerAuthHeaders } from "@/lib/api/dashboard/server-auth";
import type { ApiResponse } from "@/lib/type/dashboard/class-session";
import type {
  AttendanceSubmissionInput,
  AttendanceSubmissionResult,
  AttendanceSummaryRow,
  AttendanceUpdateInput,
  ClassAttendancePayload,
  StudentAttendanceRecord,
} from "@/lib/type/dashboard/student-attendance";

async function fetchJson<T>(path: string, fallbackMessage: string) {
  ensureApiBaseUrl();
  const serverAuthHeaders = await getServerAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...serverAuthHeaders,
    },
  });

  const payload = await parseJsonResponse<ApiResponse<T>>(response, fallbackMessage);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

async function mutateJson<T>(
  path: string,
  method: "POST" | "PATCH",
  body: unknown,
  fallbackMessage: string,
) {
  ensureApiBaseUrl();
  const serverAuthHeaders = await getServerAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...serverAuthHeaders,
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonResponse<ApiResponse<T>>(response, fallbackMessage);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

export async function submitStudentAttendanceServer(
  input: AttendanceSubmissionInput,
) {
  return mutateJson<AttendanceSubmissionResult>(
    "/student-attendance/submit",
    "POST",
    input,
    "Failed to submit attendance.",
  );
}

export async function updateStudentAttendanceServer(
  id: string,
  input: AttendanceUpdateInput,
) {
  return mutateJson<StudentAttendanceRecord>(
    `/student-attendance/${id}`,
    "PATCH",
    input,
    "Failed to update attendance.",
  );
}

export async function getClassAttendanceServer(classSessionId: string) {
  return fetchJson<ClassAttendancePayload>(
    `/student-attendance/class/${classSessionId}`,
    "Failed to load class attendance.",
  );
}

export async function getMyAttendanceSummaryServer() {
  return fetchJson<AttendanceSummaryRow[]>(
    "/student-attendance/my-attendance",
    "Failed to load attendance summary.",
  );
}
