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
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
} from "@/lib/api/dashboard/api";

export async function getAdmins(
  params: AdminListParams
): Promise<AdminListPayload> {
  ensureApiBaseUrl();

  const query = buildAdminQuery(params);
  const response = await fetch(`${API_BASE_URL}/admins?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<AdminListPayload>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load admins.");
  }

  return payload.data;
}

export async function getAdmin(id: string): Promise<Admin> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = (await response.json()) as ApiResponse<Admin>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load admin.");
  }

  return payload.data;
}

export async function createAdmin(
  payload: AdminCreatePayload
): Promise<Admin> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/users/create-admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify({
      password: payload.password,
      admin: payload.adminData,
    }),
  });

  const payloadResult = (await response.json()) as ApiResponse<Admin | Admin[]>;

  if (!response.ok || !payloadResult.success || !payloadResult.data) {
    throw new Error(payloadResult.message || "Failed to create admin.");
  }

  const created = Array.isArray(payloadResult.data)
    ? payloadResult.data[0]
    : payloadResult.data;

  if (!created) {
    throw new Error("Failed to create admin.");
  }

  return created;
}

export async function updateAdmin(
  id: string,
  input: Partial<AdminInput>
): Promise<Admin> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify({ admin: input }),
  });

  const payload = (await response.json()) as ApiResponse<Admin>;

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update admin.");
  }

  return payload.data;
}

export async function changeAdminStatus(
  userId: string,
  status: AdminStatus
): Promise<Admin> {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}/users/change-status/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  const payload = (await response.json()) as ApiResponse<Admin>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "Failed to update status.");
  }

  return payload.data ?? ({} as Admin);
}
