"use client";

import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const payload = await parseJsonResponse<ApiResponse<T>>(response, fallbackMessage);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

export async function submitStudentAttendance(
  input: AttendanceSubmissionInput,
) {
  return mutateJson<AttendanceSubmissionResult>(
    "/student-attendance/submit",
    "POST",
    input,
    "Failed to submit attendance.",
  );
}

export async function updateStudentAttendance(
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

export async function getClassAttendance(classSessionId: string) {
  return fetchJson<ClassAttendancePayload>(
    `/student-attendance/class/${classSessionId}`,
    "Failed to load class attendance.",
  );
}

export async function getMyAttendanceSummary() {
  return fetchJson<AttendanceSummaryRow[]>(
    "/student-attendance/my-attendance",
    "Failed to load attendance summary.",
  );
}
