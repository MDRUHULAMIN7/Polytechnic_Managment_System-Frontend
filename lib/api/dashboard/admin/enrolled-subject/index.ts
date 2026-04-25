import type {
  ApiResponse,
  OfferedSubjectMarkSheet,
} from "@/lib/type/dashboard/admin/enrolled-subject";
import { getSafeApiErrorMessage } from "@/utils/common/api-error";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

export async function getOfferedSubjectMarkSheet(
  offeredSubjectId: string
): Promise<OfferedSubjectMarkSheet> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/enrolled-subjects/offered-subject/${offeredSubjectId}/mark-sheet`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    }
  );

  const payload = await parseJsonResponse<ApiResponse<OfferedSubjectMarkSheet>>(
    response,
    "Failed to load mark sheet."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load mark sheet.");
  }

  return payload.data;
}

export async function updateOfferedSubjectStudentMarks(input: {
  offeredSubject: string;
  student: string;
  entries: Array<{
    componentCode: string;
    obtainedMarks: number | null;
    remarks?: string;
  }>;
  reason?: string;
}) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/enrolled-subjects/update-enrolled-subject-marks`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<unknown>>(
    response,
    "Failed to update marks."
  );

  if (!response.ok || !payload.success) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to update marks."));
  }

  return payload.data;
}

export async function releaseOfferedSubjectComponent(input: {
  offeredSubject: string;
  componentCode: string;
}) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/enrolled-subjects/release-component`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<unknown>>(
    response,
    "Failed to release component."
  );

  if (!response.ok || !payload.success) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to release component."));
  }

  return payload.data;
}

export async function publishOfferedSubjectFinalResult(input: { offeredSubject: string }) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/enrolled-subjects/publish-final-result`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<unknown>>(
    response,
    "Failed to publish final result."
  );

  if (!response.ok || !payload.success) {
    throw new Error(getSafeApiErrorMessage(payload, "Failed to publish final result."));
  }

  return payload.data;
}
