import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE,
  API_BASE_URL,
  authHeaders,
  ensureApiBaseUrl,
} from "@/lib/api/dashboard/api";
import type {
  ApiResponse,
  LatestNoticePayload,
  Notice,
  NoticeListParams,
  NoticeListPayload,
} from "@/lib/type/notice";

function buildQuery(params: NoticeListParams) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") {
      return;
    }

    query.set(key, String(value));
  });

  return query;
}

async function readAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

async function parseNoticeResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<ApiResponse<T>> {
  const text = await response.text();

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    const preview = text.slice(0, 180).replace(/\s+/g, " ").trim();
    throw new Error(
      preview
        ? `${fallbackMessage} Received: ${preview}`
        : `${fallbackMessage} Invalid JSON response.`,
    );
  }
}

async function request<T>(
  path: string,
  token: string | null,
  fallbackMessage: string,
) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    cache: "no-store",
  });

  const payload = await parseNoticeResponse<T>(response, fallbackMessage);

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || fallbackMessage);
  }

  return payload;
}

export async function getManagedNoticesServer(
  params: NoticeListParams,
): Promise<NoticeListPayload> {
  const token = await readAccessToken();
  const query = buildQuery(params);
  const payload = await request<Notice[]>(
    `/notices/manage?${query.toString()}`,
    token,
    "Failed to load managed notices.",
  );

  return {
    result: payload.data ?? [],
    meta: payload.meta ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: 0,
      totalPage: 1,
    },
  };
}

export async function getNoticesServer(
  params: NoticeListParams,
): Promise<NoticeListPayload> {
  const token = await readAccessToken();
  const query = buildQuery(params);
  const payload = await request<Notice[]>(
    `/notices?${query.toString()}`,
    token,
    "Failed to load notices.",
  );

  return {
    result: payload.data ?? [],
    meta: payload.meta ?? {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      total: 0,
      totalPage: 1,
    },
  };
}

export async function getLatestNoticesServer(limit: number = 5) {
  const token = await readAccessToken();
  const payload = await request<LatestNoticePayload>(
    `/notices/latest?limit=${limit}`,
    token,
    "Failed to load latest notices.",
  );

  return payload.data ?? { pinned: [], latest: [] };
}

export async function getNoticeServer(id: string) {
  const token = await readAccessToken();
  const payload = await request<Notice>(
    `/notices/${id}`,
    token,
    "Failed to load notice.",
  );

  if (!payload.data) {
    throw new Error("Notice not found.");
  }

  return payload.data;
}
