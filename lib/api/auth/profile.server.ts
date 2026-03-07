import { cookies } from "next/headers";
import type {
  CurrentUserProfile,
  CurrentUserProfileResponse,
} from "@/lib/type/auth/profile";
import {
  ACCESS_TOKEN_COOKIE,
  API_BASE_URL,
  authHeaders,
  ensureApiBaseUrl,
  parseJsonResponse,
} from "@/lib/api/dashboard/api";

export async function getCurrentUserProfileServer(): Promise<CurrentUserProfile> {
  ensureApiBaseUrl();

  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;

  if (!token) {
    throw new Error("Missing access token.");
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    cache: "no-store",
  });

  const payload = await parseJsonResponse<CurrentUserProfileResponse>(
    response,
    "Failed to load profile.",
  );

  if (!response.ok || !payload.success || !payload.data) {
    throw new Error(payload.message || "Failed to load profile.");
  }

  return payload.data;
}
