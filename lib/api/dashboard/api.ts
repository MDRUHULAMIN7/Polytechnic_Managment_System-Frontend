const SERVER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";

export const API_BASE_URL =
  typeof window === "undefined" ? SERVER_API_BASE_URL : "/api/proxy";
export const ACCESS_TOKEN_COOKIE = "pms_access_token";

export function ensureApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_API_BASE_URL in environment.");
  }
}

export function authHeaders(token: string | null): HeadersInit {
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

export function readBrowserCookie(name: string): string | null {
  void name;
  return null;
}

export function authHeadersFromCookie(
  name: string = ACCESS_TOKEN_COOKIE
): HeadersInit {
  void name;
  return {};
}

export async function parseJsonResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  if (response.status === 401 || response.status === 403) {
    if (typeof window === "undefined") {
      const { redirect } = await import("next/navigation");
      redirect("/dashboard/forbidden");
    }

    if (typeof window !== "undefined") {
      window.location.assign("/dashboard/forbidden");
    }

    throw new Error("You do not have permission to perform this action.");
  }

  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${fallbackMessage} Please try again later.`);
  }
}
