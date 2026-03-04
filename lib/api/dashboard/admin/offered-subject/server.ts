import { cookies } from "next/headers";
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
  OFFERED_SUBJECTS_TAG,
  offeredSubjectTag,
} from "@/lib/api/dashboard/admin/offered-subject/tags";
import {
  API_BASE_URL,
  ACCESS_TOKEN_COOKIE,
  authHeaders,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

async function readAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

async function fetchOfferedSubjectsCached(
  params: OfferedSubjectListParams,
  token: string | null
): Promise<OfferedSubjectListPayload> {
  ensureApiBaseUrl();

  const query = buildOfferedSubjectQuery(params);
  const response = await fetch(`${API_BASE_URL}/offered-subject?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [OFFERED_SUBJECTS_TAG],
    },
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

async function fetchOfferedSubjectCached(
  id: string,
  token: string | null
): Promise<OfferedSubject> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/offered-subject/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [offeredSubjectTag(id)],
    },
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

export async function getOfferedSubjectsServer(
  params: OfferedSubjectListParams
): Promise<OfferedSubjectListPayload> {
  const token = await readAccessToken();
  return fetchOfferedSubjectsCached(params, token);
}

export async function getOfferedSubjectServer(id: string): Promise<OfferedSubject> {
  const token = await readAccessToken();
  return fetchOfferedSubjectCached(id, token);
}

export async function createOfferedSubjectServer(
  input: OfferedSubjectInput
): Promise<OfferedSubject> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/offered-subject/create-offered-Subject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<OfferedSubject>>(
    response,
    "Failed to create offered subject."
  );
  if (!response.ok || !payload.success || !payload.data) {
    const errorMessage =
      (payload as { errorSources?: Array<{ message?: string }> }).errorSources?.[0]
        ?.message ||
      payload.message ||
      "Failed to create offered subject.";
    throw new Error(errorMessage);
  }

  return payload.data;
}

export async function updateOfferedSubjectServer(
  id: string,
  input: OfferedSubjectUpdateInput
): Promise<OfferedSubject> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/offered-subject/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
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

export async function deleteOfferedSubjectServer(id: string): Promise<OfferedSubject> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/offered-subject/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
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

