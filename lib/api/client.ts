import type { ApiResponse } from "./types";

type ApiErrorResponse = {
  success: false;
  message?: string;
  errorSources?: Array<{
    path?: string | number;
    message?: string;
  }>;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: URLSearchParams;
};

/**
 * All API requests go through /api/proxy/... (Next.js route).
 * The proxy reads the httpOnly `rms_access_token` cookie server-side
 * and forwards requests to the backend with the Authorization header.
 * No token is ever passed or stored client-side.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const { method = "GET", body, query } = options;

  // Strip leading slash so we can safely build the proxy path
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const proxyUrl = `/api/proxy/${cleanPath}${query ? `?${query.toString()}` : ""}`;

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(proxyUrl, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  const json = (await response.json().catch(() => null)) as ApiResponse<T> | ApiErrorResponse | null;

  if (!response.ok || !json?.success) {
    const firstErrorSourceMessage =
      json && "errorSources" in json && Array.isArray(json.errorSources)
        ? json.errorSources.find((item) => typeof item?.message === "string" && item.message.trim())?.message
        : undefined;

    const fallbackMessage =
      json && "message" in json && typeof json.message === "string" && json.message.trim()
        ? json.message
        : "Request failed.";

    throw new Error(firstErrorSourceMessage ?? fallbackMessage);
  }

  return json as ApiResponse<T>;
}
