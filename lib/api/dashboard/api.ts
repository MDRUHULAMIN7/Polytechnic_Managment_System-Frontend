export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
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
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  return decodeURIComponent(cookie.split("=")[1] ?? "");
}

export function authHeadersFromCookie(
  name: string = ACCESS_TOKEN_COOKIE
): HeadersInit {
  const token = readBrowserCookie(name);
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

export async function parseJsonResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<T> {
  const text = await response.text();

  try {
    return JSON.parse(text) as T;
  } catch {
    const preview = text.slice(0, 180).replace(/\s+/g, " ").trim();
    throw new Error(
      preview
        ? `${fallbackMessage} Received: ${preview}`
        : `${fallbackMessage} Invalid JSON response.`
    );
  }
}
