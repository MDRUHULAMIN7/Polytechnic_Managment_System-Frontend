import type {
  ApiResponse,
  OfferedSubject,
  OfferedSubjectInput,
  OfferedSubjectListParams,
  OfferedSubjectListPayload,
  OfferedSubjectUpdateInput,
} from "@/lib/type/dashboard/admin/offered-subject";
import { buildOfferedSubjectQuery } from "@/utils/dashboard/admin/offered-subject/query";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

export async function getOfferedSubjects(
  params: OfferedSubjectListParams
): Promise<OfferedSubjectListPayload> {
  ensureApiBaseUrl();

  const query = buildOfferedSubjectQuery(params);
  const response = await fetch(`${API_BASE_URL}/offered-subject?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<OfferedSubjectListPayload>>(
    response,
    "Failed to load offered subjects."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load offered subjects.");
  }

  return payload.data;
}

export async function getOfferedSubject(id: string): Promise<OfferedSubject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/offered-subject/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<OfferedSubject>>(
    response,
    "Failed to load offered subject."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load offered subject.");
  }

  return payload.data;
}

export async function createOfferedSubject(
  input: OfferedSubjectInput
): Promise<OfferedSubject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/offered-subject/create-offered-Subject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<OfferedSubject>>(
    response,
    "Failed to create offered subject."
  );

  if (!response.ok || !payload.success || !payload.data) {
    const errorSources = (
      payload as { errorSources?: Array<{ message?: string }> }
    ).errorSources;
    const errorMessage = errorSources
      ?.map((source) => source.message)
      .filter((message): message is string => Boolean(message))
      .join(", ");
    throw new Error(errorMessage || payload.message || "Failed to create offered subject.");
  }

  return payload.data;
}

export async function updateOfferedSubject(
  id: string,
  input: OfferedSubjectUpdateInput
): Promise<OfferedSubject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/offered-subject/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<OfferedSubject>>(
    response,
    "Failed to update offered subject."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update offered subject.");
  }

  return payload.data;
}

export async function deleteOfferedSubject(id: string): Promise<OfferedSubject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/offered-subject/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<OfferedSubject>>(
    response,
    "Failed to delete offered subject."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to delete offered subject.");
  }

  return payload.data ?? ({} as OfferedSubject);
}
