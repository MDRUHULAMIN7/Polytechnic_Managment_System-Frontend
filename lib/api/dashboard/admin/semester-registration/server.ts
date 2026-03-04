import { cookies } from "next/headers";
import type {
  ApiResponse,
  SemesterRegistration,
  SemesterRegistrationInput,
  SemesterRegistrationListParams,
  SemesterRegistrationListPayload,
} from "@/lib/type/dashboard/admin/semester-registration";
import { buildSemesterRegistrationQuery } from "@/utils/dashboard/admin/semester-registration/query";
import {
  SEMESTER_REGISTRATIONS_TAG,
  semesterRegistrationTag,
} from "@/lib/api/dashboard/admin/semester-registration/tags";
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

async function fetchSemesterRegistrationsCached(
  params: SemesterRegistrationListParams,
  token: string | null
): Promise<SemesterRegistrationListPayload> {
  ensureApiBaseUrl();

  const query = buildSemesterRegistrationQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/semester-registrations?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      next: {
        tags: [SEMESTER_REGISTRATIONS_TAG],
      },
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SemesterRegistrationListPayload>>(
    response,
    "Failed to load semester registrations."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load semester registrations.");
  }

  return payload.data;
}

async function fetchSemesterRegistrationCached(
  id: string,
  token: string | null
): Promise<SemesterRegistration> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/semester-registrations/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [semesterRegistrationTag(id)],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<SemesterRegistration>>(
    response,
    "Failed to load semester registration."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load semester registration.");
  }

  return payload.data;
}

export async function getSemesterRegistrationsServer(
  params: SemesterRegistrationListParams
): Promise<SemesterRegistrationListPayload> {
  const token = await readAccessToken();
  return fetchSemesterRegistrationsCached(params, token);
}

export async function getSemesterRegistrationServer(
  id: string
): Promise<SemesterRegistration> {
  const token = await readAccessToken();
  return fetchSemesterRegistrationCached(id, token);
}

export async function createSemesterRegistrationServer(
  input: SemesterRegistrationInput
): Promise<SemesterRegistration> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(
    `${API_BASE_URL}/semester-registrations/create-semester-registration`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify(input),
    }
  );

  const payload = await parseJsonResponse<ApiResponse<SemesterRegistration>>(
    response,
    "Failed to create semester registration."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create semester registration.");
  }

  return payload.data;
}

export async function updateSemesterRegistrationServer(
  id: string,
  input: Partial<SemesterRegistrationInput>
): Promise<SemesterRegistration> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/semester-registrations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<SemesterRegistration>>(
    response,
    "Failed to update semester registration."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update semester registration.");
  }

  return payload.data;
}

export async function deleteSemesterRegistrationServer(
  id: string
): Promise<SemesterRegistration> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/semester-registrations/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
  });

  const payload = await parseJsonResponse<ApiResponse<SemesterRegistration>>(
    response,
    "Failed to delete semester registration."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to delete semester registration.");
  }

  return payload.data ?? ({} as SemesterRegistration);
}

