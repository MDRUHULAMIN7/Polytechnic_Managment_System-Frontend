import { API_BASE_URL, ensureApiBaseUrl } from "@/lib/api/dashboard/api";
import type { RealtimeNotification } from "@/lib/type/realtime";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  errorSources?: Array<{
    path?: string;
    message?: string;
  }>;
};

function getApiErrorMessage<T>(payload: ApiResponse<T>, fallbackMessage: string) {
  const firstError = payload.errorSources?.find((item) => item.message?.trim());

  if (firstError?.message) {
    return firstError.path
      ? `${firstError.path}: ${firstError.message}`
      : firstError.message;
  }

  return payload.message || fallbackMessage;
}

async function parseApiResponse<T>(
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
  init?: RequestInit,
  fallbackMessage: string = "Notification request failed.",
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

  const payload = await parseApiResponse<T>(response, fallbackMessage);

  if (!response.ok || !payload.success) {
    throw new Error(getApiErrorMessage(payload, fallbackMessage));
  }

  return payload;
}

export async function getMyNotifications(limit: number = 20) {
  const payload = await request<RealtimeNotification[]>(
    `/notifications?limit=${limit}`,
    undefined,
    "Failed to load notifications.",
  );

  return payload.data ?? [];
}

export async function getUnreadNotificationCount() {
  const payload = await request<{ unreadCount: number }>(
    "/notifications/unread-count",
    undefined,
    "Failed to load notification unread count.",
  );

  return payload.data?.unreadCount ?? 0;
}

export async function markNotificationAsRead(notificationId: string) {
  await request(
    `/notifications/${notificationId}/read`,
    {
      method: "POST",
    },
    "Failed to mark notification as read.",
  );
}

export async function markAllNotificationsAsRead() {
  await request(
    "/notifications/read-all",
    {
      method: "POST",
    },
    "Failed to mark all notifications as read.",
  );
}

export async function clearAllNotifications() {
  await request(
    "/notifications",
    {
      method: "DELETE",
    },
    "Failed to clear notifications.",
  );
}
