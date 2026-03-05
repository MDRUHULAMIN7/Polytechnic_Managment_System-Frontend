import { cookies } from "next/headers";
import type {
  Admin,
  AdminCreatePayload,
  AdminInput,
  AdminListParams,
  AdminListPayload,
  AdminStatus,
  ApiResponse,
} from "@/lib/type/dashboard/admin/admin";
import { buildAdminQuery } from "@/utils/dashboard/admin/admin/query";
import { ADMINS_TAG, adminTag, userTag } from "@/lib/api/dashboard/admin/admin/tags";
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

async function fetchAdminsCached(
  params: AdminListParams,
  token: string | null
): Promise<AdminListPayload> {
  ensureApiBaseUrl();

  const query = buildAdminQuery(params);
  const response = await fetch(`${API_BASE_URL}/admins?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [ADMINS_TAG],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<AdminListPayload>>(
    response,
    "Failed to load admins."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load admins.");
  }

  return payload.data;
}

async function fetchAdminCached(id: string, token: string | null): Promise<Admin> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [adminTag(id)],
    },
  });

  const payload = await parseJsonResponse<ApiResponse<Admin>>(
    response,
    "Failed to load admin."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load admin.");
  }

  return payload.data;
}

export async function getAdminsServer(
  params: AdminListParams
): Promise<AdminListPayload> {
  const token = await readAccessToken();
  return fetchAdminsCached(params, token);
}

export async function getAdminServer(id: string): Promise<Admin> {
  const token = await readAccessToken();
  return fetchAdminCached(id, token);
}

export async function createAdminServer(
  payload: AdminCreatePayload
): Promise<Admin> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/users/create-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({
      password: payload.password,
      admin: payload.adminData,
    }),
  });

  const payloadResult = await parseJsonResponse<ApiResponse<Admin | Admin[]>>(
    response,
    "Failed to create admin."
  );

  if (!response.ok || !payloadResult.success || !payloadResult.data) {
    const errorSources = (
      payloadResult as { errorSources?: Array<{ message?: string }> }
    ).errorSources;
    const errorMessage = errorSources
      ?.map((source) => source.message)
      .filter((message): message is string => Boolean(message))
      .join(", ");
    throw new Error(errorMessage || payloadResult.message || "Failed to create admin.");
  }

  const created = Array.isArray(payloadResult.data)
    ? payloadResult.data[0]
    : payloadResult.data;

  if (!created) {
    throw new Error("Failed to create admin.");
  }

  return created;
}

export async function updateAdminServer(
  id: string,
  input: Partial<AdminInput>
): Promise<Admin> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ admin: input }),
  });

  const payload = await parseJsonResponse<ApiResponse<Admin>>(
    response,
    "Failed to update admin."
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update admin.");
  }

  return payload.data;
}

export async function changeAdminStatusServer(
  userId: string,
  status: AdminStatus
): Promise<Admin> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/users/change-status/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({ status }),
  });

  const payload = await parseJsonResponse<ApiResponse<Admin>>(
    response,
    "Failed to update status."
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to update status.");
  }

  return payload.data ?? ({} as Admin);
}

export { ADMINS_TAG, adminTag, userTag };

