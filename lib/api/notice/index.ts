import {
  API_BASE_URL,
  ensureApiBaseUrl,
} from "@/lib/api/dashboard/api";
import type {
  ApiResponse,
  LatestNoticePayload,
  Notice,
  NoticeInput,
  NoticeListParams,
  NoticeListPayload,
} from "@/lib/type/notice";

function getApiErrorMessage<T>(
  payload: ApiResponse<T>,
  fallbackMessage: string,
) {
  const firstError = payload.errorSources?.find((item) => item.message?.trim());

  if (firstError?.message) {
    return firstError.path
      ? `${firstError.path}: ${firstError.message}`
      : firstError.message;
  }

  return payload.message || fallbackMessage;
}

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

async function parseNoticeResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<ApiResponse<T>> {
  const text = await response.text();

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    const preview = text.slice(0, 160).replace(/\s+/g, " ").trim();
    throw new Error(
      preview
        ? `${fallbackMessage} Received: ${preview}`
        : `${fallbackMessage} Invalid JSON response.`,
    );
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
  fallbackMessage: string = "Request failed.",
) {
  ensureApiBaseUrl();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await parseNoticeResponse<T>(response, fallbackMessage);

  if (!response.ok || !payload.success) {
    throw new Error(getApiErrorMessage(payload, fallbackMessage));
  }

  return payload;
}

export async function getNotices(
  params: NoticeListParams,
): Promise<NoticeListPayload> {
  const query = buildQuery(params);
  const payload = await request<Notice[]>(
    `/notices?${query.toString()}`,
    undefined,
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

export async function getManagedNotices(
  params: NoticeListParams,
): Promise<NoticeListPayload> {
  const query = buildQuery(params);
  const payload = await request<Notice[]>(
    `/notices/manage?${query.toString()}`,
    undefined,
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

export async function getLatestNotices(limit: number = 5) {
  const payload = await request<LatestNoticePayload>(
    `/notices/latest?limit=${limit}`,
    undefined,
    "Failed to load latest notices.",
  );

  return payload.data ?? { pinned: [], latest: [] };
}

export async function getNotice(id: string) {
  const payload = await request<Notice>(
    `/notices/${id}`,
    undefined,
    "Failed to load notice.",
  );

  if (!payload.data) {
    throw new Error("Notice not found.");
  }

  return payload.data;
}

export async function createNotice(input: NoticeInput) {
  const payload = await request<Notice>(
    "/notices",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    "Failed to create notice.",
  );

  if (!payload.data) {
    throw new Error("Failed to create notice.");
  }

  return payload.data;
}

export async function updateNotice(id: string, input: Partial<NoticeInput>) {
  const payload = await request<Notice>(
    `/notices/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
    "Failed to update notice.",
  );

  if (!payload.data) {
    throw new Error("Failed to update notice.");
  }

  return payload.data;
}

export async function deleteNotice(id: string) {
  await request<null>(
    `/notices/${id}`,
    {
      method: "DELETE",
    },
    "Failed to delete notice.",
  );
}

export async function markNoticeAsRead(id: string) {
  await request<null>(
    `/notices/${id}/read`,
    {
      method: "POST",
    },
    "Failed to mark notice as read.",
  );
}

export async function acknowledgeNotice(id: string) {
  await request<null>(
    `/notices/${id}/acknowledge`,
    {
      method: "POST",
    },
    "Failed to acknowledge notice.",
  );
}

export async function getUnreadNoticeCount() {
  const payload = await request<{ unreadCount: number }>(
    "/notices/unread-count",
    undefined,
    "Failed to load unread count.",
  );

  return payload.data?.unreadCount ?? 0;
}
