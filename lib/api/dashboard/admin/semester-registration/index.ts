import type {
  ApiResponse,
  SemesterRegistration,
  SemesterRegistrationInput,
  SemesterRegistrationListParams,
  SemesterRegistrationListPayload,
} from "@/lib/type/dashboard/admin/semester-registration";
import { buildSemesterRegistrationQuery } from "@/utils/dashboard/admin/semester-registration/query";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
} from "@/lib/api/dashboard/api";

export async function getSemesterRegistrations(
  params: SemesterRegistrationListParams
): Promise<SemesterRegistrationListPayload> {
  ensureApiBaseUrl();

  const query = buildSemesterRegistrationQuery(params);
  const response = await fetch(
    `${API_BASE_URL}/semester-registrations?${query.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
    }
  );

  const payload = (await response.json()) as ApiResponse<SemesterRegistrationListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load semester registrations.");
  }

  return payload.data;
}

export async function getSemesterRegistration(
  id: string
): Promise<SemesterRegistration> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/semester-registrations/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<SemesterRegistration>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load semester registration.");
  }

  return payload.data;
}

export async function createSemesterRegistration(
  input: SemesterRegistrationInput
): Promise<SemesterRegistration> {
  ensureApiBaseUrl();

  const response = await fetch(
    `${API_BASE_URL}/semester-registrations/create-semester-registration`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeadersFromCookie(),
      },
      credentials: "include",
      body: JSON.stringify(input),
    }
  );

  const payload = (await response.json()) as ApiResponse<SemesterRegistration>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create semester registration.");
  }

  return payload.data;
}

export async function updateSemesterRegistration(
  id: string,
  input: Partial<SemesterRegistrationInput>
): Promise<SemesterRegistration> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/semester-registrations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as ApiResponse<SemesterRegistration>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update semester registration.");
  }

  return payload.data;
}

export async function deleteSemesterRegistration(
  id: string
): Promise<SemesterRegistration> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/semester-registrations/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<SemesterRegistration>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to delete semester registration.");
  }

  return payload.data ?? ({} as SemesterRegistration);
}
