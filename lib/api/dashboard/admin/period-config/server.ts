import { cookies } from "next/headers";
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
  ACCESS_TOKEN_COOKIE,
  authHeaders,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";
import {
  ACTIVE_PERIOD_CONFIG_TAG,
  PERIOD_CONFIGS_TAG,
  periodConfigTag,
} from "./tags";

async function readAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getPeriodConfigsServer(
  params: PeriodConfigListParams,
): Promise<PeriodConfigListPayload> {
  ensureApiBaseUrl();
  const token = await readAccessToken();
  const query = buildPeriodConfigQuery(params);
  const response = await fetch(`${API_BASE_URL}/period-configs?${query.toString()}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [PERIOD_CONFIGS_TAG],
    },
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

export async function getActivePeriodConfigServer(): Promise<PeriodConfig> {
  ensureApiBaseUrl();
  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/period-configs/active`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: {
      tags: [ACTIVE_PERIOD_CONFIG_TAG],
    },
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

export async function createPeriodConfigServer(
  input: PeriodConfigInput,
): Promise<PeriodConfig> {
  ensureApiBaseUrl();
  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/period-configs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
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

export async function updatePeriodConfigServer(
  id: string,
  input: PeriodConfigInput,
): Promise<PeriodConfig> {
  ensureApiBaseUrl();
  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}/period-configs/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
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

export { PERIOD_CONFIGS_TAG, ACTIVE_PERIOD_CONFIG_TAG, periodConfigTag };
