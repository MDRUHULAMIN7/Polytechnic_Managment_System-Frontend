import type { ApiResponse, Admin, AdminCreatePayload } from "@/lib/type/dashboard/admin/admin";
import { API_BASE_URL, authHeadersFromCookie, ensureApiBaseUrl } from "@/lib/api/dashboard/api";

export async function createAdmin(payload: AdminCreatePayload): Promise<Admin> {
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
    const errorSources = (payloadResult as { errorSources?: Array<{ message?: string }> }).errorSources;
    const errorMessage = errorSources
      ?.map((source) => source.message)
      .filter((message): message is string => Boolean(message))
      .join(", ");
    throw new Error(errorMessage || payloadResult.message || "Failed to create admin.");
  }

  const created = Array.isArray(payloadResult.data) ? payloadResult.data[0] : payloadResult.data;

  if (!created) {
    throw new Error("Failed to create admin.");
  }

  return created;
}
