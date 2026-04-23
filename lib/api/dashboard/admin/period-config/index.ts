import type {
  ApiResponse,
  PeriodConfig,
  PeriodConfigInput,
  PeriodConfigListParams,
  PeriodConfigListPayload,
} from "@/lib/type/dashboard/admin/period-config";
import { buildPeriodConfigQuery } from "@/utils/dashboard/admin/period-config/query";
import {
  API_BASE_URL,
  authHeadersFromCookie,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

export async function getPeriodConfigs(
  params: PeriodConfigListParams,
): Promise<PeriodConfigListPayload> {
  ensureApiBaseUrl();
  const query = buildPeriodConfigQuery(params);
  const response = await fetch(`${API_BASE_URL}/period-configs?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<PeriodConfigListPayload>>(
    response,
    "Failed to load period configurations.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load period configurations.");
  }

  return payload.data;
}

export async function getActivePeriodConfig(): Promise<PeriodConfig> {
  ensureApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/period-configs/active`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
  });

  const payload = await parseJsonResponse<ApiResponse<PeriodConfig>>(
    response,
    "Failed to load active period configuration.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load active period configuration.");
  }

  return payload.data;
}

export async function createPeriodConfig(
  input: PeriodConfigInput,
): Promise<PeriodConfig> {
  ensureApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/period-configs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<PeriodConfig>>(
    response,
    "Failed to create period configuration.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to create period configuration.");
  }

  return payload.data;
}

export async function updatePeriodConfig(
  id: string,
  input: PeriodConfigInput,
): Promise<PeriodConfig> {
  ensureApiBaseUrl();
  const response = await fetch(`${API_BASE_URL}/period-configs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeadersFromCookie(),
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const payload = await parseJsonResponse<ApiResponse<PeriodConfig>>(
    response,
    "Failed to update period configuration.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to update period configuration.");
  }

  return payload.data;
}
