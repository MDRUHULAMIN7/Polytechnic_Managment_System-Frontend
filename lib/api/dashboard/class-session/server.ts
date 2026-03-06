import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  API_BASE_URL,
  authHeaders,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";
import type {
  AdminClassDetails,
  ApiResponse,
  ClassSessionListParams,
  ClassSessionListPayload,
  ClassSessionFilterOptionsPayload,
  DashboardSummary,
  InstructorClassDetails,
  StartClassSessionInput,
  StudentClassDetails,
  SyncClassSessionsInput,
  SyncClassSessionsResult,
} from "@/lib/type/dashboard/class-session";
import {
  CLASS_DASHBOARD_TAG,
  CLASS_SESSIONS_TAG,
  classSessionTag,
} from "./tags";

async function readAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

function buildQuery(params: ClassSessionListParams) {
  const query = new URLSearchParams();

  const entries = Object.entries(params);
  for (const [key, value] of entries) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    query.set(key, String(value));
  }

  return query.toString();
}

async function fetchJson<T>(
  path: string,
  fallbackMessage: string,
  tags: string[],
) {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: { tags },
  });

  const payload = await parseJsonResponse<ApiResponse<T>>(response, fallbackMessage);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

async function fetchList(
  path: string,
  fallbackMessage: string,
  tags: string[],
): Promise<ClassSessionListPayload> {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    next: { tags },
  });

  const payload = await parseJsonResponse<ApiResponse<unknown[]>>(
    response,
    fallbackMessage,
  );

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || fallbackMessage);
  }

  return {
    meta: payload.meta ?? {
      page: 1,
      limit: 10,
      total: 0,
      totalPage: 1,
    },
    result: (payload.data ?? []) as ClassSessionListPayload["result"],
  };
}

async function mutateJson<T>(
  path: string,
  method: "POST" | "PATCH",
  body: unknown,
  fallbackMessage: string,
) {
  ensureApiBaseUrl();

  const token = await readAccessToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify(body),
  });

  const payload = await parseJsonResponse<ApiResponse<T>>(response, fallbackMessage);

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload.data;
}

export async function getInstructorClassSessionsServer(
  params: ClassSessionListParams,
) {
  const query = buildQuery(params);
  return fetchList(
    `/class-sessions/my${query ? `?${query}` : ""}`,
    "Failed to load instructor classes.",
    [CLASS_SESSIONS_TAG],
  );
}

export async function getStudentClassSessionsServer(
  params: ClassSessionListParams,
) {
  const query = buildQuery(params);
  return fetchList(
    `/class-sessions/my-classes${query ? `?${query}` : ""}`,
    "Failed to load student classes.",
    [CLASS_SESSIONS_TAG],
  );
}

export async function getAdminClassSessionsServer(
  params: ClassSessionListParams,
) {
  const query = buildQuery(params);
  return fetchList(
    `/class-sessions${query ? `?${query}` : ""}`,
    "Failed to load class sessions.",
    [CLASS_SESSIONS_TAG],
  );
}

export async function getInstructorClassDetailsServer(id: string) {
  return fetchJson<InstructorClassDetails>(
    `/class-sessions/${id}/instructor-details`,
    "Failed to load class details.",
    [classSessionTag(id)],
  );
}

export async function getStudentClassDetailsServer(id: string) {
  return fetchJson<StudentClassDetails>(
    `/class-sessions/${id}/student-details`,
    "Failed to load class details.",
    [classSessionTag(id)],
  );
}

export async function getAdminClassDetailsServer(id: string) {
  return fetchJson<AdminClassDetails>(
    `/class-sessions/${id}`,
    "Failed to load class details.",
    [classSessionTag(id)],
  );
}

export async function getDashboardSummaryServer() {
  return fetchJson<DashboardSummary>(
    "/class-sessions/dashboard-summary",
    "Failed to load dashboard summary.",
    [CLASS_DASHBOARD_TAG],
  );
}

export async function getClassSessionFilterOptionsServer(
  params: Pick<ClassSessionListParams, "semesterRegistration">,
) {
  const query = buildQuery(params);
  return fetchJson<ClassSessionFilterOptionsPayload>(
    `/class-sessions/filter-options${query ? `?${query}` : ""}`,
    "Failed to load class filter options.",
    [CLASS_SESSIONS_TAG],
  );
}

export async function syncClassSessionsServer(input: SyncClassSessionsInput) {
  return mutateJson<SyncClassSessionsResult>(
    "/class-sessions/sync",
    "POST",
    input,
    "Failed to sync class sessions.",
  );
}

export async function startClassSessionServer(
  id: string,
  input: StartClassSessionInput,
) {
  return mutateJson(
    `/class-sessions/${id}/start`,
    "PATCH",
    input,
    "Failed to start class session.",
  );
}

export async function completeClassSessionServer(id: string) {
  return mutateJson(
    `/class-sessions/${id}/complete`,
    "PATCH",
    {},
    "Failed to complete class session.",
  );
}
